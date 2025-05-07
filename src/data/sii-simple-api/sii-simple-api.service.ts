import { apiRequest } from '../../utils/api-helper/api-helper.utils';
import { ENVIRONMENT_VARIABLE_NOT_DEFINED_ERROR, SII_SIMPLE_API_BASE_URL } from './sii-simple-api.constants';
import { GetTransactionsForMonthError, GetTransactionsForMonthErrorCode } from './sii-simple-api.errors';
import { SimpleApiConfig, GetTransactionsForMonthParams, GetTransactionsResponse, SalesDocumentSummary, Transaction } from './sii-simple-api.interfaces';

export class SiiSimpleApiService {

  private static instances: { [label: string]: SiiSimpleApiService } = {};
  public static getInstance(label: string = '', config?: SimpleApiConfig): SiiSimpleApiService {
    let finalConfig = config;
    if (!finalConfig) {
      const apiKey = process.env.SII_SIMPLE_API_KEY;
      if (!apiKey) {
        throw new Error(ENVIRONMENT_VARIABLE_NOT_DEFINED_ERROR);
      }
      finalConfig = { apiKey};
    }
    if (SiiSimpleApiService.instances[label]) {
      return SiiSimpleApiService.instances[label];
    }
    SiiSimpleApiService.instances[label] = new SiiSimpleApiService(finalConfig);
    return SiiSimpleApiService.instances[label];
  }
  private apiKey: string;
  private baseUrl: string;
  private devEnvironment: boolean;

  constructor(config: SimpleApiConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = SII_SIMPLE_API_BASE_URL;
    this.devEnvironment = config.devEnvironment || false;
  }

  /**
   * Get transactions (sales or purchases) of a company for a specific month
   * @param {GetTransactionsForMonthParams} params Parameters for the API request
   * @param {boolean} isSales Whether to fetch sales (true) or purchases (false)
   */
  async getTransactionsForMonth(params: GetTransactionsForMonthParams, isSales: boolean): Promise<GetTransactionsResponse> {
    const { year, month, userRut, userPassword, companyRut } = params;
    const transactionType = isSales ? 'ventas' : 'compras';
    
    const { success, data, error} = await apiRequest<any>({
      method: 'POST',
      url: `${this.baseUrl}/api/RCV/${transactionType}/${month}/${year}`,
      data: {
        RutUsuario: userRut,
        PasswordSII: userPassword,
        RutEmpresa: companyRut,
        Ambiente: this.devEnvironment ? 0 : 1,
      },
      headers: {
        'Authorization': `${this.apiKey}`,
      },
    });

    if (!success) {
      let errorMessage = error?.message;
      if (error?.status && error.status >= 400 && error.status < 500 && error.data?.data) {
        errorMessage = (typeof error.data.data === 'string' || error.data.data instanceof String) ? error.data.data : error.data.data.mensaje ?? JSON.stringify(error.data);
      }
      throw new GetTransactionsForMonthError({
        message: errorMessage,
        code: GetTransactionsForMonthErrorCode.UNKNOWN_ERROR,
        data: error,
      });
    }

    return this._mapTransactionsResponse(data);
  }

  private _mapTransactionsResponse(data: any): GetTransactionsResponse {
    return {
      summaries: this._mapSummary(data.ventas.resumenes),
      sales: this._mapTransactions(data.ventas.detalleVentas),
      purchases: this._mapTransactions(data.compras.detalleCompras),
    };
  }
  private _mapSummary(summaryData: any):SalesDocumentSummary[] {
    return summaryData.map((item: any) => ({
      dteId: item.tipoDte,
      dteDescription: item.tipoDteString,
      totalDocuments: item.totalDocumentos,
      exemptAmount: item.montoExento,
      netAmount: item.montoNeto,
      recoverableIvaAmount: item.ivaRecuperable,
      commonUseIvaAmount: item.ivaUsoComun,
      notRecoverableIvaAmount: item.ivaNoRecuperable,
      totalAmount: item.montoTotal,
      status: item.estado,

    }));
  }
  private _mapTransactions(transactionsData: any):Transaction[] {
    return transactionsData.map((item: any) => ({
      dteId: item.tipoDte,
      dteDescription: item.tipoDTEString,
      saleType: item.tipoVenta,
      clientRut: item.rutCliente,
      clientName: item.razonSocial,
      folio: item.folio,
      issueDate: item.fechaEmision,
      receiptDate: item.fechaRecepcion,
      claimDate: item.fechaReclamo,
      acknowledgmentDate: item.fechaAcuseRecibo,
      exemptAmount: item.montoExento,
      netAmount: item.montoNeto,
      ivaAmount: item.montoIva,
      recoverableIvaAmount: item.montoIvaRecuperable,
      totalAmount: item.montoTotal,
      referenceDocumentType: item.tipoDocReferencia,
      referenceDocumentFolio: item.folioDocReferencia,
      otherTaxCode: item.codigoOtroImpuesto,
      otherTaxesTotalAmount: item.totalOtrosImpuestos,
      retainedIvaPartialAmount: item.ivaRetenidoParcial,
      retainedIvaTotalAmount: item.ivaRetenidoTotal,
      notRetainedIvaAmount: item.ivaNoRetenido,
      ownIvaAmount: item.ivaPropio,
      thirdPartyIvaAmount: item.ivaTerceros,
      invoiceSettlementIssuerRut: item.rutEmisorLiqFactura,
      netCommissionSettlementAmount: item.netoComisionLiqFactura,
      exemptCommissionSettlementAmount: item.exentoComisionLiqFactura,
      ivaCommissionSettlementAmount: item.ivaComisionLiqFactura,
      overdueIvaAmount: item.ivaFueraDePlazo,
      companyConstructionCredit: item.creditoEmpresaConstructora,
      guaranteeDepositContainers: item.garantiaDepEnvases,
      internalNumber: item.numeroInterno,
      nceNdeInvoicePurchase: item.nceNdeFacturaCompra,
      nonBillableAmount: item.montoNoFacturable,
      saleWithoutCostIndicator: item.indicadorVentaSinCosto,
      periodicServiceIndicator: item.indicadorServicioPeriodico,
      status: item.estado,
    }));
  }
}