export enum GetTransactionsForMonthErrorCode {
  UNKNOWN_ERROR = 'unknown-error',
}
export class GetTransactionsForMonthError extends Error {
  code: GetTransactionsForMonthErrorCode;
  data?: any;

  constructor(input: {
    code: GetTransactionsForMonthErrorCode,
    message?: string;
    data?: any,
  }) {
    super(input.message);
    this.code = input.code;
    this.data = input.data;
  }
}