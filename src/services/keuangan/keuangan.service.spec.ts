import { Test, TestingModule } from '@nestjs/testing';
import { KeuanganService } from './keuangan.service';

describe('KeuanganService', () => {
  let service: KeuanganService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeuanganService],
    }).compile();

    service = module.get<KeuanganService>(KeuanganService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
