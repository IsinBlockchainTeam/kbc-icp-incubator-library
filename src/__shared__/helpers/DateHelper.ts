export abstract class DateHelper {
    public static addDaysToDate = (days: number, date: Date = new Date()): Date => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    };
}
