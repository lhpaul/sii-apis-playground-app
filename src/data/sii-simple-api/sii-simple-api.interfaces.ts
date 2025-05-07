export interface SimpleApiConfig {
  apiKey: string;
  devEnvironment?: boolean;
}

/**
 * Base fields for params for making requests to the API.
 * @typedef {object} GetCompanyInfoParamsBase
 * @property {string} userRut - the rut to login the SII website.
 * @property {string} userPassword - the password to log in the SII website.
 * @property {string} companyRut - the rut of the company to get information from.
 */
interface GetCompanyInfoParamsBase {
  userRut: string;
  userPassword: string;
  companyRut: string;
}

/**
 * Params for getting transactions of a company for a specific month.
 * @typedef {object} GetTransactionsPerMonthParams
 * @property {number} year - the year.
 * @property {number} month - the month.
 */
export interface GetTransactionsForMonthParams extends GetCompanyInfoParamsBase {
  year: number;
  month: number;
}

/**
 * Params for getting transactions of a company for a specific day.
 * @typedef {object} GetTransactionsPerMonthParams
 * @property {number} day - the calendar day.
 */
export interface GetTransactionsForDayParams extends GetTransactionsForMonthParams {
  day: string;
}

export interface SalesDocumentSummary {
  dteId: number; // Código del tipo de DTE (ej. 33=Factura Electrónica).
  dteDescription: string; // Descripción legible del TipoDTE.
  totalDocuments: number; // Total de documentos.
  exemptAmount: number; // Total de monto exento.
  netAmount: number; // Total de monto neto.
  recoverableIvaAmount: number; // Total de monto IVA recuperable. Siempre es igual al monto IVA.
  commonUseIvaAmount: number; // Total de monto IVA de uso común.
  notRecoverableIvaAmount: number; // Total de monto IVA no recuperable.
  totalAmount: number; // Total de monto total.
  status: string | null; // Estado del documento ("Reclamado", "Confirmada", "Pendiente", etc.). Puede ser null si no se conoce.
}

export interface Transaction {
  dteId: number; // Código del tipo de DTE (ej. 33=Factura Electrónica).
  dteDescription: string; // Descripción legible del TipoDTE.
  saleType: string | null; // Tipo de venta (campo opcional).
  clientRut: string; // RUT del cliente.
  clientName: string; // Razón social del cliente.
  folio: number; // Folio del documento.
  issueDate: string; // Fecha de emisión del documento. Formato: YYYY-MM-DDTHH:MM:SS.
  receiptDate: string; // Fecha de recepción. Formato: YYYY-MM-DDTHH:MM:SS. Puede ser null si no se conoce.
  claimDate: string; // Fecha de reclamo. Formato: YYYY-MM-DDTHH:MM:SS. Puede ser null si no se conoce.
  acknowledgmentDate: string; // Fecha de acuse de recibo. Formato: YYYY-MM-DDTHH:MM:SS. Puede ser null si no se conoce.
  exemptAmount: number; // Monto exento.
  netAmount: number; // Monto neto.
  ivaAmount: number; // Monto IVA.
  recoverableIvaAmount: number; // Monto IVA recuperable. Siempre es igual al monto IVA.
  totalAmount: number; // Monto total.
  referenceDocumentType: number; // Tipo de documento de referencia.
  referenceDocumentFolio: string; // Folio del documento de referencia.
  otherTaxCode: number; // Código de otro impuesto no estandarizado.
  otherTaxesTotalAmount: number; // Total otros impuestos.
  retainedIvaPartialAmount: number; // IVA retenido parcial.
  retainedIvaTotalAmount: number; // IVA retenido total.
  notRetainedIvaAmount: number; // IVA no retenido.
  ownIvaAmount: number; // IVA propio.
  thirdPartyIvaAmount: number; // IVA de terceros.
  invoiceSettlementIssuerRut: string; // RUT del emisor de la liquidación factura.
  netCommissionSettlementAmount: number; // Neto comisión liquidación factura.
  exemptCommissionSettlementAmount: number; // Exento comisión liquidación factura.
  ivaCommissionSettlementAmount: number; // IVA comisión liquidación factura.
  overdueIvaAmount: number; // IVA fuera de plazo.
  companyConstructionCredit: number; // Crédito empresa constructora.
  guaranteeDepositContainers: number; // Garantía depósito envases.
  internalNumber: string; // Número interno.
  nceNdeInvoicePurchase: string; // NCE/NDE de la factura de compra.
  nonBillableAmount: number; // Monto no facturable.
  saleWithoutCostIndicator: number; // Indicador de venta sin costo.
  periodicServiceIndicator: number; // Indicador de servicio periódico.
  status: string; // Estado del documento ("Reclamado", "Confirmada", "Pendiente", etc.).
}

export interface GetTransactionsResponse {
  summaries: SalesDocumentSummary[];
  sales: Transaction[];
  purchases: Transaction[];
}
