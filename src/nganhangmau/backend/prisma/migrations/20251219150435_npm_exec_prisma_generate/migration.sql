-- CreateTable
CREATE TABLE "khomau" (
    "makho" VARCHAR(10) NOT NULL,
    "tenvitri" VARCHAR(255),
    "nhietdobaoquan" VARCHAR(50),

    CONSTRAINT "pk_khomau" PRIMARY KEY ("makho")
);

-- CreateTable
CREATE TABLE "nguoihienmau" (
    "manguoihien" VARCHAR(10) NOT NULL,
    "hotennguoihien" VARCHAR(50),
    "ngaysinh" DATE,
    "gioitinh" VARCHAR(5),
    "email" VARCHAR(50),
    "diachi" VARCHAR(100),
    "sodienthoai" VARCHAR(10),
    "nhommau" VARCHAR(10),
    "rhesus" VARCHAR(5),
    "ngaytao" DATE,
    "trangthai" VARCHAR(20),

    CONSTRAINT "pk_nguoihienmau" PRIMARY KEY ("manguoihien")
);

-- CreateTable
CREATE TABLE "nhanvienyte" (
    "manvyt" VARCHAR(10) NOT NULL,
    "hotennvyt" VARCHAR(50),
    "ngaysinh" DATE,
    "gioitinh" VARCHAR(5),
    "emailnv" VARCHAR(50),
    "diachi" VARCHAR(100),
    "sodienthoai" VARCHAR(10),
    "vaitro" VARCHAR(20),
    "ngaytao" DATE,
    "trangthai" VARCHAR(20),

    CONSTRAINT "pk_nhanvienyte" PRIMARY KEY ("manvyt")
);

-- CreateTable
CREATE TABLE "phieuhienmau" (
    "maphieuhien" VARCHAR(10) NOT NULL,
    "manvyt" VARCHAR(10) NOT NULL,
    "manguoihien" VARCHAR(10) NOT NULL,
    "ngaytaophieuhien" DATE,
    "luongmauhien" DECIMAL,
    "trangthai" VARCHAR(20),
    "hienlan" VARCHAR(10),

    CONSTRAINT "pk_phieuhienmau" PRIMARY KEY ("maphieuhien")
);

-- CreateTable
CREATE TABLE "phieukham" (
    "maphieukham" VARCHAR(10) NOT NULL,
    "manguoihien" VARCHAR(10) NOT NULL,
    "manvyt" VARCHAR(10) NOT NULL,
    "ngaytaophieukham" DATE,
    "ghichu" VARCHAR(50),
    "ngaykham" DATE,
    "ketquasangloc" VARCHAR(50),

    CONSTRAINT "pk_phieukham" PRIMARY KEY ("maphieukham")
);

-- CreateTable
CREATE TABLE "phutrach" (
    "manvyt" VARCHAR(10) NOT NULL,
    "makho" VARCHAR(10) NOT NULL,
    "ngayphutrach" DATE,

    CONSTRAINT "pk_phutrach" PRIMARY KEY ("manvyt","makho")
);

-- CreateTable
CREATE TABLE "tuimau" (
    "matuimau" VARCHAR(10) NOT NULL,
    "makho" VARCHAR(10) NOT NULL,
    "manguoihien" VARCHAR(10) NOT NULL,
    "thetich" DECIMAL,
    "ngaynhapkho" DATE,
    "hansudung" DATE,
    "trangthai" VARCHAR(50),

    CONSTRAINT "pk_tuimau" PRIMARY KEY ("matuimau")
);

-- CreateIndex
CREATE UNIQUE INDEX "khomau_pk" ON "khomau"("makho");

-- CreateIndex
CREATE UNIQUE INDEX "nguoihienmau_pk" ON "nguoihienmau"("manguoihien");

-- CreateIndex
CREATE UNIQUE INDEX "nhanvienyte_pk" ON "nhanvienyte"("manvyt");

-- CreateIndex
CREATE UNIQUE INDEX "phieuhienmau_pk" ON "phieuhienmau"("maphieuhien");

-- CreateIndex
CREATE INDEX "dothien_fk" ON "phieuhienmau"("manguoihien");

-- CreateIndex
CREATE INDEX "lap_fk" ON "phieuhienmau"("manvyt");

-- CreateIndex
CREATE UNIQUE INDEX "phieukham_pk" ON "phieukham"("maphieukham");

-- CreateIndex
CREATE INDEX "duoctao_fk" ON "phieukham"("manvyt");

-- CreateIndex
CREATE INDEX "thuoc_fk" ON "phieukham"("manguoihien");

-- CreateIndex
CREATE INDEX "phutrach2_fk" ON "phutrach"("makho");

-- CreateIndex
CREATE INDEX "phutrach_fk" ON "phutrach"("manvyt");

-- CreateIndex
CREATE UNIQUE INDEX "phutrach_pk" ON "phutrach"("manvyt", "makho");

-- CreateIndex
CREATE UNIQUE INDEX "tuimau_pk" ON "tuimau"("matuimau");

-- CreateIndex
CREATE INDEX "quanly_fk" ON "tuimau"("makho");

-- CreateIndex
CREATE INDEX "thamgia_fk" ON "tuimau"("manguoihien");

-- AddForeignKey
ALTER TABLE "phieuhienmau" ADD CONSTRAINT "fk_phieuhie_dothien_nguoihie" FOREIGN KEY ("manguoihien") REFERENCES "nguoihienmau"("manguoihien") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "phieuhienmau" ADD CONSTRAINT "fk_phieuhie_lap_nhanvien" FOREIGN KEY ("manvyt") REFERENCES "nhanvienyte"("manvyt") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "phieukham" ADD CONSTRAINT "fk_phieukham_duoctao_nhanvien" FOREIGN KEY ("manvyt") REFERENCES "nhanvienyte"("manvyt") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "phieukham" ADD CONSTRAINT "fk_phieukham_thuoc_nguoihien" FOREIGN KEY ("manguoihien") REFERENCES "nguoihienmau"("manguoihien") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "phutrach" ADD CONSTRAINT "fk_phutrach_phutrach2_khomau" FOREIGN KEY ("makho") REFERENCES "khomau"("makho") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "phutrach" ADD CONSTRAINT "fk_phutrach_phutrach_nhanvien" FOREIGN KEY ("manvyt") REFERENCES "nhanvienyte"("manvyt") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "tuimau" ADD CONSTRAINT "fk_tuimau_quanly_khomau" FOREIGN KEY ("makho") REFERENCES "khomau"("makho") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "tuimau" ADD CONSTRAINT "fk_tuimau_thamgia_nguoihie" FOREIGN KEY ("manguoihien") REFERENCES "nguoihienmau"("manguoihien") ON DELETE RESTRICT ON UPDATE RESTRICT;
