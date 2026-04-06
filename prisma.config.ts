import "dotenv/config";
import { defineConfig } from '@prisma/config';

export default defineConfig({
  engine: 'library',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
