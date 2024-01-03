import { ISODate } from '@/sharedDataModel';

export function smartSchedule({
  before,
  after,
}: {
  before?: ISODate;
  after?: ISODate;
}): ISODate {
  if (before && after) {
    return new Date(
      (new Date(before).getTime() + new Date(after).getTime()) / 2
    ).toISOString();
  } else if (before) {
    return new Date(
      new Date(before).getTime() - 1000 * 60 * 60 * 24
    ).toISOString();
  } else if (after) {
    return new Date(
      new Date(after).getTime() + 1000 * 60 * 60 * 24
    ).toISOString();
  } else {
    return new Date().toISOString();
  }
}
