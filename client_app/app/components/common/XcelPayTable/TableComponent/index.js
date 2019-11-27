import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Table, Dropdown } from 'semantic-ui-react';
import LoadingIndicator from 'components/LoadingIndicator';


const customFormatter = (data, customFormat = (d) => d) => customFormat(data);

const TableComponent = (props) => {
  const {
    headers, loading, tableData, pager, setPerPage, onPaginate, setPage,
  } = props;
  const dataList = tableData.get('dataList').toJS();
  return (
    <Table celled unstackable sortable>
      {headers.length > 0 &&
      <Table.Header>
        <Table.Row>{headers.map((header) => (
          <Table.HeaderCell key={`table_header_${header.key}`}>
            {header.name || ''}
          </Table.HeaderCell>
        ))}
        </Table.Row>
      </Table.Header>}
      {/* Here i am assuming tableData props is a map with dataList list always there */}
      {(dataList.length === 0) ?
        <Table.Body>
          <Table.Row>
            <Table.Cell>{loading ? <LoadingIndicator /> : 'No data'}</Table.Cell>
          </Table.Row>
        </Table.Body> :
        <Table.Body>
          {dataList.map((tData) => {
            const uniqueVal = JSON.stringify(tData);
            return (
              <Table.Row key={`table_row_${uniqueVal}`} className={loading ? 'table_row_loading' : ''}>
                {headers.map((header) => {
                  const headerFormat = header.format ? header.format : (data) => data[header.field];
                  return <Table.Cell key={`table_cell_${header.key}_${uniqueVal}`}>{customFormatter(tData, headerFormat)}</Table.Cell>;
                })}
              </Table.Row>
            );
          })}
        </Table.Body>}
      { onPaginate &&
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell>
              <Dropdown
                upward selection value={pager.pageSize} onChange={setPerPage}
                options={[
                  { key: '10', value: 10, text: '10 Rows' }, { key: '20', value: 20, text: '20 Rows' },
                  { key: '50', value: 50, text: '50 Rows' }, { key: '100', value: 100, text: '100 Rows' },
                ]}
              />
            </Table.HeaderCell>
            <Table.HeaderCell colSpan={headers.length + 1}>
              <Menu floated="right" pagination>
                <Menu.Item
                  as="a" icon className={(pager.currentPage === 1) ? 'disabled' : ''}
                  value={pager.currentPage - 1} onClick={(pager.currentPage === 1) ? () => null : setPage}
                >
                  <i className="icon-chevron-left" />
                </Menu.Item>
                {pager.pages.map((page) => (
                  <Menu.Item
                    key={`table_pager_${page}`} active={pager.currentPage === page} value={page}
                    onClick={(pager.currentPage !== page) ? props.setPage : () => null}
                  >
                    {page}
                  </Menu.Item>
                ))}
                <Menu.Item
                  as="a" icon className={(pager.currentPage === pager.totalPages) ? 'disabled' : ''}
                  value={pager.currentPage + 1} onClick={(pager.currentPage === pager.totalPages) ? () => null : setPage}
                >
                  <i className="icon-chevron-right" />
                </Menu.Item>
              </Menu>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>}
    </Table>
  );
};

TableComponent.propTypes = {
  headers: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  tableData: PropTypes.object.isRequired,
  pager: PropTypes.object.isRequired,
  setPerPage: PropTypes.func.isRequired,
  onPaginate: PropTypes.func,
  setPage: PropTypes.func.isRequired,
};

export default TableComponent;
