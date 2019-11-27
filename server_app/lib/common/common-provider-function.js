((providerHelper) => {
  'use strict';

  const Promise = require("bluebird");
  const join = Promise.join;

    providerHelper.getPaginatedDataList = (Collection, queryOpts, pagerOpts, projectFields, sortOpts) => {
        return join(Collection
                .find(queryOpts, {projection: projectFields})
                .skip(pagerOpts.perPage * (pagerOpts.page - 1))
                .limit(pagerOpts.perPage)
                .sort(sortOpts).toArray(), Collection.estimatedDocumentCount(queryOpts),
            (dataList, count) => {
                return {
                    dataList: dataList,
                    totalItems: count,
                    currentPage: pagerOpts.page
                };
            });
    };

  providerHelper.checkForDuplicateRecords = async (Collection, queryOpts, objSave) => {
    const count = await Collection.count(queryOpts);
    if(count > 0){
      return Promise.resolve({
        exists: true
      });
    }else{

      const dataRes = await Collection.save(objSave);
      return Promise.resolve({
        exists: false,
        dataRes: dataRes
      });
    }
  };

})(module.exports);
