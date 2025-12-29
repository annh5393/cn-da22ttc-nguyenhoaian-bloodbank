import app from './app';
import prisma from './config/prisma';

const PORT = process.env.PORT || 2000;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Kết nối cơ sở dữ liệu thành công');

    app.listen(PORT, () => {
      console.log(`Server chạy trên http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Không thể khởi động server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nĐang tắt server');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();