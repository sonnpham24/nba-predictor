import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Thiếu username'),
  password: z.string().min(1, 'Thiếu password'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username phải có ít nhất 3 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ').optional().or(z.literal('')),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().optional(),
});

export const predictionSchema = z.object({
  matchupId: z.number({ message: 'Thiếu matchupId' }),
  teamA: z.string().min(1, 'Thiếu teamA'),
  teamB: z.string().min(1, 'Thiếu teamB'),
  predictedWinner: z.string().min(1, 'Thiếu predictedWinner'),
  predictedScore: z.string().regex(/^\d+-\d+$/, 'Tỷ số phải có dạng X-Y (ví dụ 4-2)'),
});

export const lockTimeSchema = z.object({
  matchupId: z.number({ message: 'Thiếu matchupId' }),
  lockTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Thời gian lockTime không hợp lệ',
  }),
});

export const resultSchema = z.object({
  matchupId: z.number({ message: 'Thiếu matchupId' }),
  actualWinner: z.string().min(1, 'Thiếu actualWinner'),
  actualScore: z.string().regex(/^\d+-\d+$/, 'Tỷ số phải có dạng X-Y (ví dụ 4-2)'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PredictionInput = z.infer<typeof predictionSchema>;
export type LockTimeInput = z.infer<typeof lockTimeSchema>;
export type ResultInput = z.infer<typeof resultSchema>;
