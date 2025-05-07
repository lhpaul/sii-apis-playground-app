import React, { useState, useContext } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getFilteredRowModel,
  flexRender,
  SortingState,
  createColumnHelper
} from '@tanstack/react-table';
import { CSVLink } from 'react-csv';
import { ConfigContext } from '../contexts/ConfigContext';
import { Transaction, SiiSimpleApiService, GetTransactionsForMonthError } from '../data';

const PURCHASES_DATA_STORAGE_KEY = 'purchasesData';
const PURCHASES_QUERY_PARAMS_KEY = 'purchasesQueryParams';

const PurchasesPage: React.FC = () => {
  const { generalConfig, apiConfig } = useContext(ConfigContext);
  
  // Initialize state from local storage or defaults
  const [month, setMonth] = useState(() => {
    const savedParams = localStorage.getItem(PURCHASES_QUERY_PARAMS_KEY);
    return savedParams ? JSON.parse(savedParams).month || '' : '';
  });
  
  const [year, setYear] = useState(() => {
    const savedParams = localStorage.getItem(PURCHASES_QUERY_PARAMS_KEY);
    return savedParams ? JSON.parse(savedParams).year || '' : '';
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const [purchasesData, setPurchasesData] = useState<Transaction[]>(() => {
    const savedData = localStorage.getItem(PURCHASES_DATA_STORAGE_KEY);
    if (savedData) {
      // Set a timeout to clear the message after 5 seconds
      setTimeout(() => setInfoMessage(''), 5000);
      return JSON.parse(savedData);
    }
    return [];
  });

  const validateForm = () => {
    if (!month || !year) {
      setError('Por favor, seleccione un mes y un año');
      return false;
    }
    if (!generalConfig.userRut || !generalConfig.userPassword || !generalConfig.companyRut) {
      setError('Por favor, complete la configuración general');
      return false;
    }
    if (!apiConfig.apiKey) {
      setError('Por favor, ingrese la API Key');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Save query parameters to localStorage
    const queryParams = { month, year };
    localStorage.setItem(PURCHASES_QUERY_PARAMS_KEY, JSON.stringify(queryParams));

    setLoading(true);
    setError('');

    try {
      // Call the API to get purchases data
      const { purchases } = await SiiSimpleApiService.getInstance('default', {
        apiKey: apiConfig.apiKey,
      }).getTransactionsForMonth({
        year: parseInt(year),
        month: parseInt(month),
        userRut: generalConfig.userRut,
        userPassword: generalConfig.userPassword,
        companyRut: generalConfig.companyRut
      }, false);

      // Save purchases data to localStorage and update state
      localStorage.setItem(PURCHASES_DATA_STORAGE_KEY, JSON.stringify(purchases));
      setPurchasesData(purchases);
    } catch (err) {
      if (err instanceof GetTransactionsForMonthError) {
        setError(err.message);
      } else {
        setError('Error al obtener los datos de compras');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadJsonData = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(purchasesData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `purchases_${year}_${month}.json`;
    link.click();
  };
  
  // Function to clear saved data
  const clearStoredData = () => {
    localStorage.removeItem(PURCHASES_DATA_STORAGE_KEY);
    localStorage.removeItem(PURCHASES_QUERY_PARAMS_KEY);
    setPurchasesData([]);
    setMonth('');
    setYear('');
  };

  const columnHelper = createColumnHelper<Transaction>();
  
  const columns = [
    columnHelper.accessor('dteId', {
      header: 'Tipo DTE',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('dteDescription', {
      header: 'Descripción DTE',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('saleType', {
      header: 'Tipo de Compra',
      cell: info => info.getValue() ?? '',
    }),
    columnHelper.accessor('clientRut', {
      header: 'RUT Proveedor',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('clientName', {
      header: 'Nombre Proveedor',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('folio', {
      header: 'Folio',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('issueDate', {
      header: 'Fecha Emisión',
      cell: info => info.getValue() ? new Date(info.getValue()).toLocaleString('es-CL') : '',
    }),
    columnHelper.accessor('receiptDate', {
      header: 'Fecha Recepción',
      cell: info => info.getValue() ? new Date(info.getValue()).toLocaleString('es-CL') : '',
    }),
    columnHelper.accessor('claimDate', {
      header: 'Fecha Reclamo',
      cell: info => info.getValue() ? new Date(info.getValue()).toLocaleString('es-CL') : '',
    }),
    columnHelper.accessor('acknowledgmentDate', {
      header: 'Fecha Acuse',
      cell: info => info.getValue() ? new Date(info.getValue()).toLocaleString('es-CL') : '',
    }),
    columnHelper.accessor('exemptAmount', {
      header: 'Monto Exento',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('netAmount', {
      header: 'Monto Neto',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('ivaAmount', {
      header: 'IVA',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('recoverableIvaAmount', {
      header: 'IVA Recuperable',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('totalAmount', {
      header: 'Total',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('referenceDocumentType', {
      header: 'Tipo Doc. Ref.',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('referenceDocumentFolio', {
      header: 'Folio Doc. Ref.',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('otherTaxCode', {
      header: 'Código Otro Impuesto',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('otherTaxesTotalAmount', {
      header: 'Total Otros Impuestos',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('retainedIvaPartialAmount', {
      header: 'IVA Retenido Parcial',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('retainedIvaTotalAmount', {
      header: 'IVA Retenido Total',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('notRetainedIvaAmount', {
      header: 'IVA No Retenido',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('ownIvaAmount', {
      header: 'IVA Propio',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('thirdPartyIvaAmount', {
      header: 'IVA Terceros',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('invoiceSettlementIssuerRut', {
      header: 'RUT Emisor Liquidación',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('netCommissionSettlementAmount', {
      header: 'Neto Comisión Liquidación',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('exemptCommissionSettlementAmount', {
      header: 'Exento Comisión Liquidación',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('ivaCommissionSettlementAmount', {
      header: 'IVA Comisión Liquidación',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('overdueIvaAmount', {
      header: 'IVA Fuera de Plazo',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('companyConstructionCredit', {
      header: 'Crédito Empresa Constructora',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('guaranteeDepositContainers', {
      header: 'Garantía Depósito Envases',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('internalNumber', {
      header: 'Número Interno',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('nceNdeInvoicePurchase', {
      header: 'NCE/NDE Factura Compra',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('nonBillableAmount', {
      header: 'Monto No Facturable',
      cell: info => info.getValue()?.toLocaleString('es-CL'),
    }),
    columnHelper.accessor('saleWithoutCostIndicator', {
      header: 'Indicador Compra Sin Costo',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('periodicServiceIndicator', {
      header: 'Indicador Servicio Periódico',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('status', {
      header: 'Estado',
      cell: info => info.getValue(),
    }),
  ];

  const table = useReactTable({
    data: purchasesData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const monthOptions = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, index) => ({
    value: (currentYear - index).toString(),
    label: (currentYear - index).toString(),
  }));

  return (
    <div>
      <h2 className="content-header">Compras</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {infoMessage && <div className="alert alert-info">{infoMessage}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="month">Mes</label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="form-control"
              >
                <option value="">Seleccione un mes</option>
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="year">Año</label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="form-control"
              >
                <option value="">Seleccione un año</option>
                {yearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Cargando...' : 'Obtener Compras'}
        </button>
      </form>

      {purchasesData.length > 0 && (
        <>
          <div className="form-row" style={{ marginTop: '20px' }}>
            <div className="form-col">
              <div className="form-group">
                <label htmlFor="filter">Buscar</label>
                <input
                  id="filter"
                  type="text"
                  placeholder="Filtrar resultados..."
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="button-group">
            <CSVLink
              data={purchasesData}
              filename={`purchases_${year}_${month}.csv`}
              className="button"
              target="_blank"
            >
              Exportar CSV
            </CSVLink>
            <button onClick={downloadJsonData} className="button button-secondary">
              Exportar JSON
            </button>
            <button onClick={clearStoredData} className="button button-danger">
              Limpiar Datos
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? ''}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PurchasesPage; 