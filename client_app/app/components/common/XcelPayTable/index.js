import React from 'react';
import PropTypes from 'prop-types';
import TableComponent from './TableComponent/index';
import getPager from './helpers/GetPager';

class XcelTokenTable extends React.PureComponent {
  static propTypes = {
    tableData: PropTypes.object.isRequired,
    perPage: PropTypes.number.isRequired,
    onPaginate: PropTypes.func,
  };
  static defaultProps = {
    perPage: 10,
  };
  state = {
    pager: (() => {
      const { tableData, perPage } = this.props;
      if (tableData.size > 0) {
        const totalItems = tableData.get('totalItems');
        const currentPage = tableData.get('currentPage');
        return getPager(totalItems, currentPage, perPage);
      }
      return {
        totalItems: 0,
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        startPage: 1,
        endPage: 1,
        startIndex: 0,
        endIndex: 9,
        pages: [1],
      };
    })(),
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.tableData !== this.props.tableData) {
      const { tableData, perPage } = nextProps;
      if (tableData.size > 0) {
        const totalItems = tableData.get('totalItems');
        const currentPage = tableData.get('currentPage');
        const pager = getPager(totalItems, currentPage, perPage);
        this.setState({ pager });
      }
    }
  }
  setPage = (event, { value }) => {
    const { pager } = this.state;
    if (value < 1 || value > pager.totalPages) {
      return;
    }
    const newPager = getPager(pager.totalItems, value, pager.pageSize);
    this.setState({ pager: newPager }, () =>
      this.props.onPaginate(value, pager.pageSize)
    );
  };
  setPerPage = (event, { value }) => {
    const { pager } = this.state;
    if (value === pager.pageSize) {
      return;
    }
    if (pager.totalItems < pager.currentPage * value) {
      const newPager = getPager(pager.totalItems, 1, value); // safe side! can be calculated to go to max right limit
      this.setState({ pager: newPager });
      this.props.onPaginate(newPager.currentPage, value);
    } else {
      const newPager = getPager(pager.totalItems, pager.currentPage, value);
      this.setState({ pager: newPager });
      this.props.onPaginate(newPager.currentPage, value);
    }
  };
  render() {
    return (
      <div className="table-responsive mg-top-sm">
        <TableComponent {...this.state} {...this.props} setPerPage={this.setPerPage} setPage={this.setPage} />
      </div>
    );
  }
}

export default XcelTokenTable;
