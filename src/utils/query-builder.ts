import type { Query } from 'mongoose';
import type QueryString from 'qs';

export class QueryBuilder<ResultType, DocType> {
  query: Query<ResultType, DocType>;
  queryObject;
  queryFields: string;
  querySort: string;
  queryPage: string;
  queryLimit: string;

  constructor(
    query: Query<ResultType, DocType>,
    queryData: QueryString.ParsedQs,
  ) {
    this.query = query;
    const {
      page: queryPage,
      sort: querySort,
      limit: queryLimit,
      fields: queryFields,
      ...queryObject
    } = queryData;
    this.queryPage = queryPage as string;
    this.querySort = querySort as string;
    this.queryLimit = queryLimit as string;
    this.queryFields = queryFields as string;
    this.queryObject = queryObject;
  }

  filter() {
    const searchQuery = JSON.parse(
      JSON.stringify({ ...this.queryObject }).replaceAll(
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`,
      ),
    );
    this.query = this.query.find(searchQuery) as Query<ResultType, DocType>;
    return this;
  }

  sort() {
    // sorting
    if (this.querySort) {
      const sortBy = this.querySort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort('-createdAt name');
    return this;
  }

  selectFields() {
    if (this.queryFields) {
      const fields = this.queryFields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else this.query = this.query.select('-__v');
    return this;
  }

  paginate() {
    const page = +this.queryPage || 1;
    const limit = +this.queryLimit || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
