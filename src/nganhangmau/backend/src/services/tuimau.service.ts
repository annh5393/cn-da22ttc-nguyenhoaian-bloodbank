import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export class TuiMauService {
  /**
   * Map nhóm máu + Rh vào mã vị trí kho cố định
   */
  getKhoByBloodGroup(nhommau?: string | null, rhesus?: string | null): { mavitri: string; makho: string } {
    const nhom = (nhommau || '').toUpperCase();
    const rhInput = (rhesus || '').trim();
    const rh = rhInput === 'Âm' || rhInput === '-' ? 'AM' : 'DUONG';
    const positionCodeMap = {
      A_DUONG: { mavitri: 'VT_A_DUONG', makho: 'KHO_MAIN' },
      A_AM: { mavitri: 'VT_A_AM', makho: 'KHO_MAIN' },
      B_DUONG: { mavitri: 'VT_B_DUONG', makho: 'KHO_MAIN' },
      B_AM: { mavitri: 'VT_B_AM', makho: 'KHO_MAIN' },
      O_DUONG: { mavitri: 'VT_O_DUONG', makho: 'KHO_MAIN' },
      O_AM: { mavitri: 'VT_O_AM', makho: 'KHO_MAIN' },
      AB_DUONG: { mavitri: 'VT_AB_DUONG', makho: 'KHO_MAIN' },
      AB_AM: { mavitri: 'VT_AB_AM', makho: 'KHO_MAIN' },
    } as const;
    const key = `${nhom}_${rh}`;
    if (key in positionCodeMap) {
      return positionCodeMap[key as keyof typeof positionCodeMap];
    }
    return positionCodeMap['O_DUONG'];
  }
  /**
   * Get blood inventory statistics by blood type (only available)
   */
  async getInventoryByBloodType() {
    // Get blood types from donors
    const bloodTypes = await prisma.$queryRaw<
      Array<{ nhommau: string; rhesus: string; count: bigint; total_volume: Prisma.Decimal | null }>
    >`
      SELECT 
        n.nhommau,
        n.rhesus,
        COUNT(t.matuimau)::bigint as count,
        SUM(t.thetich) as total_volume
      FROM tuimau t
      JOIN nguoihienmau n ON t.manguoihien = n.manguoihien
      WHERE t.trangthai IN ('CON_HAN','SAP_HET_HAN')
        AND t.hansudung >= CURRENT_DATE
      GROUP BY n.nhommau, n.rhesus
      ORDER BY count DESC
    `;

    return bloodTypes.map((item) => ({
      nhommau: item.nhommau,
      rhesus: item.rhesus,
      count: Number(item.count),
      totalVolume: item.total_volume ? Number(item.total_volume) : 0,
    }));
  }

  /**
   * Get comprehensive blood inventory statistics (ALL blood types including expired)
   */
  async getComprehensiveInventory() {
    // Get all blood types with detailed status
    const bloodTypes = await prisma.$queryRaw<
      Array<{
        nhommau: string;
        rhesus: string;
        available: bigint;
        expired: bigint;
        expiring_soon: bigint;
        total_volume: Prisma.Decimal | null;
        available_volume: Prisma.Decimal | null;
      }>
    >`
      SELECT 
        n.nhommau,
        n.rhesus,
        COUNT(CASE WHEN t.trangthai IN ('CON_HAN','SAP_HET_HAN') AND t.hansudung >= CURRENT_DATE THEN 1 END)::bigint as available,
        COUNT(CASE WHEN t.hansudung < CURRENT_DATE THEN 1 END)::bigint as expired,
        COUNT(CASE WHEN t.trangthai IN ('CON_HAN','SAP_HET_HAN') AND t.hansudung >= CURRENT_DATE AND t.hansudung <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END)::bigint as expiring_soon,
        SUM(t.thetich) as total_volume,
        SUM(CASE WHEN t.trangthai IN ('CON_HAN','SAP_HET_HAN') AND t.hansudung >= CURRENT_DATE THEN t.thetich ELSE 0 END) as available_volume
      FROM nguoihienmau n
      LEFT JOIN tuimau t ON t.manguoihien = n.manguoihien
      WHERE n.nhommau IS NOT NULL AND n.rhesus IS NOT NULL
      GROUP BY n.nhommau, n.rhesus
      ORDER BY n.nhommau, n.rhesus
    `;

    return bloodTypes.map((item) => ({
      nhommau: item.nhommau,
      rhesus: item.rhesus,
      available: Number(item.available),
      expired: Number(item.expired),
      expiringSoon: Number(item.expiring_soon),
      totalVolume: item.total_volume ? Number(item.total_volume) : 0,
      availableVolume: item.available_volume ? Number(item.available_volume) : 0,
      total: Number(item.available) + Number(item.expired),
    }));
  }

  /**
   * Get expiring blood bags (within next 7 days)
   */
  async getExpiringBloodBags(days: number = 7) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return await prisma.tuimau.findMany({
      where: {
        trangthai: { in: ['CON_HAN','SAP_HET_HAN'] },
        hansudung: {
          gte: new Date(),
          lte: targetDate,
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
      orderBy: {
        hansudung: 'asc',
      },
    });
  }

  /**
   * Get expired blood bags
   */
  async getExpiredBloodBags() {
    return await prisma.tuimau.findMany({
      where: {
        trangthai: { in: ['CON_HAN','SAP_HET_HAN'] },
        hansudung: {
          lt: new Date(),
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
      orderBy: {
        hansudung: 'asc',
      },
    });
  }

  /**
   * Check low stock for specific blood types with severity levels
   */
  async checkLowStock(threshold: number = 10) {
    const inventory = await this.getInventoryByBloodType();

    // Return all blood types with severity level
    return inventory.map((item) => {
      let severity: 'critical' | 'very-low' | 'low' | 'warning' | 'safe';
      let label: string;
      
      if (item.count === 0) {
        severity = 'critical';
        label = 'Hết hàng';
      } else if (item.count <= 3) {
        severity = 'very-low';
        label = 'Rất thấp';
      } else if (item.count <= 7) {
        severity = 'low';
        label = 'Thấp';
      } else if (item.count <= 10) {
        severity = 'warning';
        label = 'Cần bổ sung';
      } else {
        severity = 'safe';
        label = 'Đủ';
      }

      return {
        ...item,
        severity,
        label,
      };
    }).filter((item) => item.count <= threshold); // Only return items at or below threshold
  }

  /**
   * Get warehouse inventory details
   */
  async getWarehouseInventory(makho: string) {
    const bags = await prisma.tuimau.findMany({
      where: {
        makho,
        trangthai: { in: ['CON_HAN','SAP_HET_HAN'] },
      },
      include: {
        nguoihienmau: {
          select: {
            nhommau: true,
            rhesus: true,
            hotennguoihien: true,
          },
        },
      },
    });

    // Group by blood type
    const grouped = bags.reduce((acc: any, bag: any) => {
      const key = `${bag.nguoihienmau.nhommau}${bag.nguoihienmau.rhesus}`;
      if (!acc[key]) {
        acc[key] = {
          nhommau: bag.nguoihienmau.nhommau,
          rhesus: bag.nguoihienmau.rhesus,
          // no position info in current schema
          bags: [],
          totalVolume: 0,
          count: 0,
        };
      }
      acc[key].bags.push(bag);
      acc[key].totalVolume += Number(bag.thetich || 0);
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(grouped);
  }
}

export default new TuiMauService();
