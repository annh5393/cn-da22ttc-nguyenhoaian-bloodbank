import prisma from '../config/prisma';
//import { Prisma } from '@prisma/client';

export class ReportService {
  /**
   * Monthly donation report
   */
  async getMonthlyDonationReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const donations = await prisma.phieuhienmau.findMany({
      where: {
        ngaytaophieuhien: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        nguoihienmau: {
          select: {
            nhommau: true,
            rhesus: true,
          },
        },
        nhanvienyte: {
          select: {
            hotennvyt: true,
          },
        },
      },
    });

    const totalDonations = donations.length;
    const totalVolume = donations.reduce(
      (sum: number, d: any) => sum + Number(d.luongmauhien || 0),
      0
    );

    // Group by blood type
    const byBloodType = donations.reduce((acc: any, d: any) => {
      const key = `${d.nguoihienmau.nhommau}${d.nguoihienmau.rhesus}`;
      if (!acc[key]) {
        acc[key] = {
          nhommau: d.nguoihienmau.nhommau,
          rhesus: d.nguoihienmau.rhesus,
          count: 0,
          volume: 0,
        };
      }
      acc[key].count += 1;
      acc[key].volume += Number(d.luongmauhien || 0);
      return acc;
    }, {});

    // Group by status
    const byStatus = donations.reduce((acc: any, d: any) => {
      const status = d.trangthai || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      period: {
        year,
        month,
        startDate,
        endDate,
      },
      summary: {
        totalDonations,
        totalVolume,
      },
      byBloodType: Object.values(byBloodType),
      byStatus,
    };
  }

  /**
   * Blood usage report (consumed/used blood bags)
   */
  async getBloodUsageReport(startDate: Date, endDate: Date) {
    const usedBags = await prisma.tuimau.findMany({
      where: {
        trangthai: 'DA_DUNG',
        ngaynhapkho: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        nguoihienmau: {
          select: {
            nhommau: true,
            rhesus: true,
          },
        },
      },
    });

    const totalUsed = usedBags.length;
    const totalVolume = usedBags.reduce(
      (sum: number, bag: any) => sum + Number(bag.thetich || 0),
      0
    );

    const byBloodType = usedBags.reduce((acc: any, bag: any) => {
      const key = `${bag.nguoihienmau.nhommau}${bag.nguoihienmau.rhesus}`;
      if (!acc[key]) {
        acc[key] = {
          nhommau: bag.nguoihienmau.nhommau,
          rhesus: bag.nguoihienmau.rhesus,
          count: 0,
          volume: 0,
        };
      }
      acc[key].count += 1;
      acc[key].volume += Number(bag.thetich || 0);
      return acc;
    }, {});

    return {
      period: { startDate, endDate },
      summary: { totalUsed, totalVolume },
      byBloodType: Object.values(byBloodType),
    };
  }

  /**
   * Comprehensive monthly report
   */
  async getComprehensiveMonthlyReport(year: number, month: number) {
    const donationReport = await this.getMonthlyDonationReport(year, month);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const usageReport = await this.getBloodUsageReport(startDate, endDate);

    // Current inventory
    const currentInventory = await prisma.tuimau.groupBy({
      by: ['trangthai'],
      _count: {
        matuimau: true,
      },
      _sum: {
        thetich: true,
      },
    });

    // Expired bags in month
    const expiredBags = await prisma.tuimau.count({
      where: {
        hansudung: {
          gte: startDate,
          lte: endDate,
        },
        trangthai: 'HET_HAN',
      },
    });

    return {
      reportDate: new Date(),
      period: { year, month },
      donations: donationReport,
      usage: usageReport,
      inventory: currentInventory.map((item) => ({
        trangthai: item.trangthai,
        count: item._count.matuimau,
        totalVolume: item._sum.thetich ? Number(item._sum.thetich) : 0,
      })),
      expiredBags,
    };
  }

  /**
   * Donor activity report
   */
  async getDonorActivityReport(startDate: Date, endDate: Date) {
    const activeDonors = await prisma.phieuhienmau.groupBy({
      by: ['manguoihien'],
      where: {
        ngaytaophieuhien: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        maphieuhien: true,
      },
      _sum: {
        luongmauhien: true,
      },
    });

    const topDonors = await prisma.nguoihienmau.findMany({
      where: {
        manguoihien: {
          in: activeDonors.map((d) => d.manguoihien),
        },
      },
      select: {
        manguoihien: true,
        hotennguoihien: true,
        nhommau: true,
        rhesus: true,
        _count: {
          select: {
            phieuhienmau: true,
          },
        },
      },
      orderBy: {
        phieuhienmau: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return {
      period: { startDate, endDate },
      totalActiveDonors: activeDonors.length,
      topDonors,
    };
  }

  /**
   * Get statistics dashboard
   */
  async getDashboardStats() {
    const [
      totalDonors,
      totalStaff,
      totalBags,
      availableBags,
      expiringBags,
      todayDonations,
    ] = await Promise.all([
      prisma.nguoihienmau.count(),
      prisma.nhanvienyte.count(),
      prisma.tuimau.count(),
      prisma.tuimau.count({
        where: {
          trangthai: { in: ['CON_HAN', 'SAP_HET_HAN'] },
          hansudung: { gte: new Date() },
        },
      }),
      prisma.tuimau.count({
        where: {
          trangthai: { in: ['CON_HAN', 'SAP_HET_HAN'] },
          hansudung: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.phieuhienmau.count({
        where: {
          ngaytaophieuhien: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalDonors,
      totalStaff,
      totalBags,
      availableBags,
      expiringBags,
      todayDonations,
    };
  }
}

export default new ReportService();
