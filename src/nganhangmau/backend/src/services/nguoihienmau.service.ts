import prisma from '../config/prisma';
import { NotFoundError, /*ValidationError */ } from '../types/errors';

export class NguoiHienMauService {
  /**
   * Get all donors with optional filters
   */
  async getAllDonors(filters?: {
    nhommau?: string;
    rhesus?: string;
    gioitinh?: string;
  }) {
    return await prisma.nguoihienmau.findMany({
      where: {
        nhommau: filters?.nhommau,
        rhesus: filters?.rhesus,
        gioitinh: filters?.gioitinh,
      },
      include: {
        phieuhienmau: {
          orderBy: { ngaytaophieuhien: 'desc' },
          take: 5,
        },
        phieukham: {
          orderBy: { ngaykham: 'desc' },
          take: 1,
        },
        tuimau: true,
      },
    });
  }

  /**
   * Get donor by ID with full details
   */
  async getDonorById(manguoihien: string) {
    const donor = await prisma.nguoihienmau.findUnique({
      where: { manguoihien },
      include: {
        phieuhienmau: {
          orderBy: { ngaytaophieuhien: 'desc' },
        },
        phieukham: {
          orderBy: { ngaykham: 'desc' },
        },
        tuimau: {
          include: {
            khomau: true,
          },
        },
      },
    });

    if (!donor) {
      throw new NotFoundError('Không tìm thấy người hiến máu');
    }

    return donor;
  }

  /**
   * Check if donor is eligible to donate
   */
  async checkDonorEligibility(manguoihien: string) {
    const donor = await this.getDonorById(manguoihien);

    // Get latest health check
    const latestCheck = donor.phieukham[0];
    if (!latestCheck) {
      return {
        eligible: false,
        reason: 'Chưa có phiếu khám sàng lọc',
      };
    }

    // Check if health check passed (normalize diacritics/case)
    const normalizeVi = (s?: string | null) => {
      if (!s) return '';
      return s.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    };
    const isDat = (val?: string | null) => normalizeVi(val) === 'DAT';

    if (!isDat(latestCheck.ketquasangloc)) {
      return {
        eligible: false,
        reason: 'Kết quả khám sàng lọc không đạt',
      };
    }

    // Check last donation date (must be at least 3 months ago)
    const latestDonation = donor.phieuhienmau[0];
    if (latestDonation) {
      const monthsSinceLastDonation =
        (new Date().getTime() - new Date(latestDonation.ngaytaophieuhien!).getTime()) /
        (1000 * 60 * 60 * 24 * 30);

      if (monthsSinceLastDonation < 3) {
        return {
          eligible: false,
          reason: `Phải chờ ít nhất 3 tháng kể từ lần hiến trước (${Math.ceil(monthsSinceLastDonation)} tháng)`,
          nextEligibleDate: new Date(
            new Date(latestDonation.ngaytaophieuhien!).getTime() + 90 * 24 * 60 * 60 * 1000
          ),
        };
      }
    }

    return {
      eligible: true,
      reason: 'Đủ điều kiện hiến máu',
    };
  }

  /**
   * Get donor statistics
   */
  async getDonorStats(manguoihien: string) {
    const donor = await this.getDonorById(manguoihien);

    const totalDonations = donor.phieuhienmau.length;
    const totalBloodDonated = donor.phieuhienmau.reduce(
      (sum, phieu) => sum + Number(phieu.luongmauhien || 0),
      0
    );

    const firstDonation = donor.phieuhienmau[donor.phieuhienmau.length - 1];
    const latestDonation = donor.phieuhienmau[0];

    return {
      donor: {
        manguoihien: donor.manguoihien,
        hotennguoihien: donor.hotennguoihien,
        nhommau: donor.nhommau,
        rhesus: donor.rhesus,
      },
      stats: {
        totalDonations,
        totalBloodDonated,
        firstDonationDate: firstDonation?.ngaytaophieuhien,
        latestDonationDate: latestDonation?.ngaytaophieuhien,
        activeBags: donor.tuimau.filter((bag) => {
          if (!bag.hansudung) return false;
          const now = new Date();
          return bag.trangthai === 'CON_HAN' || (bag.trangthai === 'SAP_HET_HAN' && bag.hansudung >= now);
        }).length,
      },
    };
  }
}

export default new NguoiHienMauService();
