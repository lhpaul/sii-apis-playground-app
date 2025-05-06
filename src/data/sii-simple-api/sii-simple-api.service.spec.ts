import { jest, describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { apiRequest } from '../../utils/api-helper/api-helper.utils';
import { ENVIRONMENT_VARIABLE_NOT_DEFINED_ERROR, SII_SIMPLE_API_BASE_URL } from './sii-simple-api.constants';
import { SiiSimpleApiService } from './sii-simple-api.service';
import { GetSalesForMonthError, GetSalesForMonthErrorCode } from './sii-simple-api.errors';


// Mock the apiRequest function
jest.mock('../../utils/api-helper/api-helper.utils', () => ({
  apiRequest: jest.fn(),
}));

describe('SiiSimpleApiService', () => {
  const mockApiKey = 'test-api-key';
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SII_SIMPLE_API_KEY = mockApiKey;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getInstance', () => {
    describe('when no config is provided', () => {
      it('should throw an error if SII_SIMPLE_API_KEY is not defined', () => {
        delete process.env.SII_SIMPLE_API_KEY;
        expect(() => SiiSimpleApiService.getInstance()).toThrow(
          ENVIRONMENT_VARIABLE_NOT_DEFINED_ERROR
        );
      });
      it('should create a new instance if none exists', () => {
        const instance = SiiSimpleApiService.getInstance();
        expect(instance).toBeInstanceOf(SiiSimpleApiService);
        expect(instance['apiKey']).toBe(mockApiKey);
      });
  
      it('should return the existing instance if one exists', () => {
        const instance1 = SiiSimpleApiService.getInstance();
        const instance2 = SiiSimpleApiService.getInstance();
        expect(instance1).toBe(instance2);
      });
    });

    describe('when config is provided', () => {
      const providedConfig = {
        apiKey: 'provided-api-key',
      };
      it('should create a new instance with the provided config', () => {
        const instance = SiiSimpleApiService.getInstance('first', providedConfig);
        expect(instance).toBeInstanceOf(SiiSimpleApiService);
        expect(instance['apiKey']).toBe(providedConfig.apiKey);
      });
  
      it('should return the existing instance if one exists', () => {
        const instance1 = SiiSimpleApiService.getInstance('first', providedConfig);
        const instance2 = SiiSimpleApiService.getInstance('first');
        expect(instance1).toBe(instance2);
        expect(instance2['apiKey']).toBe(providedConfig.apiKey);
      });

      it('should return a different instance if a different config is provided', () => {
        const secondConfig = {
          apiKey: 'second-api-key',
        };
        const instance1 = SiiSimpleApiService.getInstance('first', providedConfig);
        const instance2 = SiiSimpleApiService.getInstance('second', secondConfig);
        expect(instance1).not.toBe(instance2);
        expect(instance1['apiKey']).toBe(providedConfig.apiKey);
        expect(instance2['apiKey']).toBe(secondConfig.apiKey);
      });
    });
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      const service = new SiiSimpleApiService({
        apiKey: mockApiKey,
      });
      expect(service['apiKey']).toBe(mockApiKey);
      expect(service['baseUrl']).toBe(SII_SIMPLE_API_BASE_URL);
      expect(service['devEnvironment']).toBe(false);
    });

    it('should set devEnvironment to true if provided', () => {
      const devService = new SiiSimpleApiService({
        apiKey: mockApiKey,
        devEnvironment: true,
      });
      expect(devService['devEnvironment']).toBe(true);
    });
  });

  describe('getSalesForMonth', () => {
    const mockParams = {
      year: 2023,
      month: 1,
      userRut: '12345678-9',
      userPassword: 'password123',
      companyRut: '98765432-1',
    };
    let service: SiiSimpleApiService;

    beforeEach(() => {
      service = SiiSimpleApiService.getInstance();
    });

    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          ventas: {
            resumenes: [
              {
                tipoDte: 33,
                tipoDteString: 'FACTURA ELECTRONICA',
                totalDocumentos: 10,
                montoExento: 0,
                montoNeto: 1000000,
                ivaRecuperable: 190000,
                ivaUsoComun: 0,
                ivaNoRecuperable: 0,
                montoTotal: 1190000,
                estado: 'REGISTRO',
              },
            ],
            detalleVentas: [
              {
                tipoDte: 33,
                tipoDTEString: 'FACTURA ELECTRONICA',
                tipoVenta: 'AFECTA',
                rutCliente: '12345678-9',
                razonSocial: 'CLIENTE TEST',
                folio: '123456',
                fechaEmision: '2023-01-15',
                fechaRecepcion: '2023-01-15',
                fechaReclamo: null,
                fechaAcuseRecibo: null,
                montoExento: 0,
                montoNeto: 100000,
                montoIva: 19000,
                montoIvaRecuperable: 19000,
                montoTotal: 119000,
                tipoDocReferencia: null,
                folioDocReferencia: null,
                codigoOtroImpuesto: null,
                totalOtrosImpuestos: 0,
                ivaRetenidoParcial: 0,
                ivaRetenidoTotal: 0,
                ivaNoRetenido: 0,
                ivaPropio: 0,
                ivaTerceros: 0,
                rutEmisorLiqFactura: null,
                netoComisionLiqFactura: 0,
                exentoComisionLiqFactura: 0,
                ivaComisionLiqFactura: 0,
                ivaFueraDePlazo: 0,
                creditoEmpresaConstructora: 0,
                garantiaDepEnvases: 0,
                numeroInterno: null,
                nceNdeFacturaCompra: null,
                montoNoFacturable: 0,
                indicadorVentaSinCosto: null,
                indicadorServicioPeriodico: null,
                estado: 'REGISTRO',
              },
            ],
          },
        },
      };
      (apiRequest as jest.MockedFunction<any>).mockResolvedValueOnce(mockResponse);

      await service.getSalesForMonth(mockParams);

      expect(apiRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: expect.stringContaining(`/api/RCV/ventas/${mockParams.month}/${mockParams.year}`),
        data: {
          RutUsuario: mockParams.userRut,
          PasswordSII: mockParams.userPassword,
          RutEmpresa: mockParams.companyRut,
          Ambiente: 1, // Production environment
        },
        headers: {
          'Authorization': mockApiKey,
        },
      });
    });

    it('should use development environment if devEnvironment is true', async () => {
      const devService = new SiiSimpleApiService({
        apiKey: mockApiKey,
        devEnvironment: true,
      });

      const mockResponse = {
        success: true,
        data: {
          ventas: {
            resumenes: [],
            detalleVentas: [],
          },
        },
      };

      (apiRequest as jest.MockedFunction<any>).mockResolvedValueOnce(mockResponse);

      await devService.getSalesForMonth(mockParams);

      expect(apiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            Ambiente: 0, // Development environment
          }),
        })
      );
    });

    it('should throw GetSalesForMonthError on API error', async () => {
      const mockErrorResponse = {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'API request failed',
        },
      };

      (apiRequest as jest.MockedFunction<any>).mockResolvedValueOnce(mockErrorResponse);

      try {
        await service.getSalesForMonth(mockParams);
        expect(false).toBe(true); // This line should not be reached
      } catch (error) {
        expect(error).toBeInstanceOf(GetSalesForMonthError);
        expect((error as GetSalesForMonthError).message).toBe(mockErrorResponse.error.message);
        expect((error as GetSalesForMonthError).code).toBe(GetSalesForMonthErrorCode.UNKNOWN_ERROR);
        expect((error as GetSalesForMonthError).data).toEqual(mockErrorResponse.error);
      }
    });

    it('should map sales response data correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          ventas: {
            resumenes: [
              {
                tipoDte: 33,
                tipoDteString: 'FACTURA ELECTRONICA',
                totalDocumentos: 10,
                montoExento: 0,
                montoNeto: 1000000,
                ivaRecuperable: 190000,
                ivaUsoComun: 0,
                ivaNoRecuperable: 0,
                montoTotal: 1190000,
                estado: 'REGISTRO',
              },
              {
                tipoDte: 34,
                tipoDteString: 'FACTURA EXENTA ELECTRONICA',
                totalDocumentos: 5,
                montoExento: 500000,
                montoNeto: 0,
                ivaRecuperable: 0,
                ivaUsoComun: 0,
                ivaNoRecuperable: 0,
                montoTotal: 500000,
                estado: 'REGISTRO',
              },
            ],
            detalleVentas: [
              {
                tipoDte: 33,
                tipoDTEString: 'FACTURA ELECTRONICA',
                tipoVenta: 'AFECTA',
                rutCliente: '12345678-9',
                razonSocial: 'CLIENTE TEST',
                folio: '123456',
                fechaEmision: '2023-01-15',
                fechaRecepcion: '2023-01-15',
                fechaReclamo: null,
                fechaAcuseRecibo: null,
                montoExento: 0,
                montoNeto: 100000,
                montoIva: 19000,
                montoIvaRecuperable: 19000,
                montoTotal: 119000,
                tipoDocReferencia: null,
                folioDocReferencia: null,
                codigoOtroImpuesto: null,
                totalOtrosImpuestos: 0,
                ivaRetenidoParcial: 0,
                ivaRetenidoTotal: 0,
                ivaNoRetenido: 0,
                ivaPropio: 0,
                ivaTerceros: 0,
                rutEmisorLiqFactura: null,
                netoComisionLiqFactura: 0,
                exentoComisionLiqFactura: 0,
                ivaComisionLiqFactura: 0,
                ivaFueraDePlazo: 0,
                creditoEmpresaConstructora: 0,
                garantiaDepEnvases: 0,
                numeroInterno: null,
                nceNdeFacturaCompra: null,
                montoNoFacturable: 0,
                indicadorVentaSinCosto: null,
                indicadorServicioPeriodico: null,
                estado: 'REGISTRO',
              },
            ],
          },
        },
      };

      (apiRequest as jest.MockedFunction<any>).mockResolvedValueOnce(mockResponse);

      const result = await service.getSalesForMonth(mockParams);

      // Verify summaries mapping
      expect(result.summaries).toHaveLength(2);
      expect(result.summaries[0]).toEqual({
        dteId: 33,
        dteDescription: 'FACTURA ELECTRONICA',
        totalDocuments: 10,
        exemptAmount: 0,
        netAmount: 1000000,
        recoverableIvaAmount: 190000,
        commonUseIvaAmount: 0,
        notRecoverableIvaAmount: 0,
        totalAmount: 1190000,
        status: 'REGISTRO',
      });

      // Verify transactions mapping
      expect(result.sales).toHaveLength(1);
      expect(result.sales[0]).toEqual({
        dteId: 33,
        dteDescription: 'FACTURA ELECTRONICA',
        saleType: 'AFECTA',
        clientRut: '12345678-9',
        clientName: 'CLIENTE TEST',
        folio: '123456',
        issueDate: '2023-01-15',
        receiptDate: '2023-01-15',
        claimDate: null,
        acknowledgmentDate: null,
        exemptAmount: 0,
        netAmount: 100000,
        ivaAmount: 19000,
        recoverableIvaAmount: 19000,
        totalAmount: 119000,
        referenceDocumentType: null,
        referenceDocumentFolio: null,
        otherTaxCode: null,
        otherTaxesTotalAmount: 0,
        retainedIvaPartialAmount: 0,
        retainedIvaTotalAmount: 0,
        notRetainedIvaAmount: 0,
        ownIvaAmount: 0,
        thirdPartyIvaAmount: 0,
        invoiceSettlementIssuerRut: null,
        netCommissionSettlementAmount: 0,
        exemptCommissionSettlementAmount: 0,
        ivaCommissionSettlementAmount: 0,
        overdueIvaAmount: 0,
        companyConstructionCredit: 0,
        guaranteeDepositContainers: 0,
        internalNumber: null,
        nceNdeInvoicePurchase: null,
        nonBillableAmount: 0,
        saleWithoutCostIndicator: null,
        periodicServiceIndicator: null,
        status: 'REGISTRO',
      });
    });
  });
});