export enum GetSalesForMonthErrorCode {
  UNKNOWN_ERROR = 'unknown-error',
}
export class GetSalesForMonthError extends Error {
  code: GetSalesForMonthErrorCode;
  data?: any;

  constructor(input: {
    code: GetSalesForMonthErrorCode,
    message?: string;
    data?: any,
  }) {
    super(input.message);
    this.code = input.code;
    this.data = input.data;
  }
}