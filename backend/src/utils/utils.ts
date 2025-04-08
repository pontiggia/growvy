import { Counter } from '../models/counterModel';

export async function getNextSequenceValue(
  sequenceName: string,
): Promise<number> {
  const updatedCounter = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true },
  );

  return updatedCounter?.sequenceValue || 1;
}
