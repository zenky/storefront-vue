import { Schedule, Stock } from '@zenky/api';

export function getStockSchedule(schedule: Schedule): string {
  if (!schedule) {
    return 'Закрыто';
  } else if (!schedule.today.open && schedule.today.next_open_at) {
    return `Откроется ${schedule.today.next_open_at.short}`;
  } else if (!schedule.today.open) {
    return 'Закрыто';
  } else if (!schedule.today.closing_at) {
    return `Сегодня: ${schedule.today.hours[0]}`;
  }

  const diff = schedule.today.closing_at.timestamp - (new Date().getTime() / 1000);
  const min = 60 * 60;

  if (diff < min) {
    return `Закроется ${schedule.today.closing_at.diff.toLowerCase()}`;
  }

  return `Сегодня: ${schedule.today.hours[0]}`;
}

export function getStockAddress(stock: Stock): string | null {
  if (!stock || !stock.address) {
    return null;
  }

  return stock.address.address;
}
