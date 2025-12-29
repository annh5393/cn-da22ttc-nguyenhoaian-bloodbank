import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { computeTuiMauStatus, TUI_MAU_STATUS } from '../utils/status';

export const getAllTuiMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    void req;
    // Chỉ lấy túi máu đang active
    const tuimau = await prisma.tuimau.findMany({
      include: {
        khomau: true,
        nguoihienmau: true,
      },
      orderBy: {
        ngaynhapkho: 'desc',
      },
    });
    res.json(tuimau);
  } catch (error) {
    next(error);
  }
};

export const getTuiMauById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const tuimau = await prisma.tuimau.findFirst({
      where: { 
        matuimau: id,
      },
      include: {
        khomau: true,
        nguoihienmau: true,
      },
    });

    if (!tuimau) {
      res.status(404).json({ error: 'Túi máu không tồn tại hoặc đã bị xóa' });
      return;
    }

    res.json(tuimau);
  } catch (error) {
    next(error);
  }
};

export const createTuiMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { matuimau, makho, manguoihien, thetich, ngaynhapkho, mavitri } = req.body as {
      matuimau: string;
      makho?: string;
      manguoihien: string;
      thetich?: number;
      ngaynhapkho?: string | Date;
      mavitri?: string; // virtual position code for validation only
    };

    // VALIDATION: Admin không được nhập kho trực tiếp
    const user = (req as any).user;
    if (user?.vaitro === 'Admin') {
      res.status(403).json({ 
        error: 'Admin không được phép nhập kho trực tiếp',
        note: 'Chỉ Nhân viên y tế mới có quyền nhập kho'
      });
      return;
    }

    // Validate donor exists and has confirmed blood type
    const donor = await prisma.nguoihienmau.findFirst({ where: { manguoihien }, select: { manguoihien: true, nhommau: true, rhesus: true } });
    if (!donor) {
      res.status(400).json({ error: 'Không tìm thấy người hiến để gán túi máu' });
      return;
    }
    if (!donor.nhommau || !donor.rhesus) {
      res.status(400).json({ error: 'Phiếu hiến chưa có kết quả xét nghiệm nhóm máu/Rh' });
      return;
    }

    // Validate selected virtual position code matches donor blood type
    const toPositionCode = (nhom?: string | null, rh?: string | null) => {
      const n = (nhom || '').toUpperCase();
      const r = (rh || '').trim();
      const isDuong = r === '+' || r === 'Dương' || r.toUpperCase() === 'DUONG';
      const isAm = r === '-' || r === 'Âm' || r.toUpperCase() === 'AM';
      const token = isDuong ? 'DUONG' : (isAm ? 'AM' : 'DUONG');
      return `VT_${n}_${token}`;
    };
    const expectedCode = toPositionCode(donor.nhommau, donor.rhesus);
    if (!mavitri) {
      res.status(400).json({ error: 'Thiếu mã vị trí kho (mavitri) để xác thực' });
      return;
    }
    const validCode = /^VT_(A|B|O|AB)_(DUONG|AM)$/i.test(mavitri);
    if (!validCode) {
      res.status(400).json({ error: 'Mã vị trí kho không hợp lệ' });
      return;
    }
    if (mavitri.toUpperCase() !== expectedCode.toUpperCase()) {
      res.status(400).json({ error: 'Vị trí kho không phù hợp với nhóm máu/Rh của túi máu' });
      return;
    }

    // Set dates and status based on 35-day shelf life with last 5 days as expiring
    const nhapDate = ngaynhapkho ? new Date(ngaynhapkho) : new Date();
    const hanSuDung = new Date(nhapDate);
    hanSuDung.setDate(hanSuDung.getDate() + 35);
    const computedStatus = computeTuiMauStatus(hanSuDung) || TUI_MAU_STATUS.CON_HAN;

    const tuimau = await prisma.tuimau.create({
      data: {
        matuimau,
        makho: makho || 'KHO_MAIN',
        manguoihien,
        thetich,
        ngaynhapkho: nhapDate,
        hansudung: hanSuDung,
        trangthai: computedStatus,
      },
    });

    res.status(201).json(tuimau);
  } catch (error) {
    next(error);
  }
};

// Summary per computed positions by blood type (virtual positions)
export const getPositionSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bags = await prisma.tuimau.findMany({
      include: {
        nguoihienmau: { select: { nhommau: true, rhesus: true } },
      },
    });
    const map = new Map<string, { mavitri: string; tenvitri: string; count: number; totalVolume: number }>();
    const label = (nhommau?: string | null, rhesus?: string | null) => {
      const n = (nhommau || '').toUpperCase();
      const r = (rhesus || '').trim();
      const rh = r === '-' || r === 'Âm' ? '-' : '+';
      const code = `VT_${n}_${rh === '+' ? 'DUONG' : 'AM'}`;
      const ten = `Vị trí ${n}${rh}`;
      return { code, ten };
    };
    for (const b of bags) {
      const { code, ten } = label(b.nguoihienmau?.nhommau, b.nguoihienmau?.rhesus);
      const key = code;
      if (!map.has(key)) map.set(key, { mavitri: code, tenvitri: ten, count: 0, totalVolume: 0 });
      const agg = map.get(key)!;
      agg.count += 1;
      agg.totalVolume += Number(b.thetich || 0);
    }
    res.json(Array.from(map.values()));
  } catch (error) {
    next(error);
  }
};

// List bags by a computed position code
export const getBagsByPosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { mavitri } = req.params as { mavitri?: string };
    if (!mavitri) {
      res.status(400).json({ error: 'Thiếu mã vị trí' });
      return;
    }
    const m = /^VT_(A|B|O|AB)_(DUONG|AM)$/i.exec(mavitri);
    if (!m) {
      res.status(400).json({ error: 'Mã vị trí không hợp lệ' });
      return;
    }
    const [_, g, rhtoken] = m;
    const group = (g || '').toUpperCase();
    const rh = rhtoken === 'DUONG' ? '+' : '-';
    const bags = await prisma.tuimau.findMany({
      where: {},
      include: {
        nguoihienmau: { select: { nhommau: true, rhesus: true, hotennguoihien: true } },
        khomau: { select: { makho: true, tenvitri: true } },
      },
      orderBy: { hansudung: 'asc' },
    });
    const filtered = bags.filter(b => (b.nguoihienmau?.nhommau || '').toUpperCase() === group && ((b.nguoihienmau?.rhesus || '').trim() === rh));
    res.json({ position: { mavitri, tenvitri: `Vị trí ${group}${rh}` }, bags: filtered });
  } catch (error) {
    next(error);
  }
};

export const updateTuiMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { thetich, ngaynhapkho } = req.body;

    // Recompute expiry and status if nhập kho date changes
    let nhapDate: Date | undefined = undefined;
    let hanSuDung: Date | undefined = undefined;
    let computedStatus: string | undefined = undefined;
    if (ngaynhapkho) {
      nhapDate = new Date(ngaynhapkho);
      hanSuDung = new Date(nhapDate);
      hanSuDung.setDate(hanSuDung.getDate() + 35);
      computedStatus = computeTuiMauStatus(hanSuDung) || TUI_MAU_STATUS.CON_HAN;
    }

    const tuimau = await prisma.tuimau.update({
      where: { matuimau: id },
      data: {
        thetich,
        ngaynhapkho: nhapDate ?? undefined,
        hansudung: hanSuDung ?? undefined,
        trangthai: computedStatus ?? undefined,
      },
    });

    res.json(tuimau);
  } catch (error) {
    next(error);
  }
};

export const deleteTuiMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    void req;
    res.status(405).json({ error: 'Không cho phép xóa túi máu; chỉ được cập nhật trạng thái' });
  } catch (error) {
    next(error);
  }
};

// Mark bag used or disposed
export const updateBagStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { trangthai } = req.body as { trangthai: string };
    const allowed: Set<string> = new Set([TUI_MAU_STATUS.DA_DUNG, TUI_MAU_STATUS.HUY, TUI_MAU_STATUS.CON_HAN, TUI_MAU_STATUS.SAP_HET_HAN, TUI_MAU_STATUS.HET_HAN]);
    if (!allowed.has(trangthai)) {
      res.status(400).json({ error: 'Trạng thái không hợp lệ' });
      return;
    }
    const bag = await prisma.tuimau.update({ where: { matuimau: id }, data: { trangthai } });
    res.json(bag);
  } catch (error) {
    next(error);
  }
};
