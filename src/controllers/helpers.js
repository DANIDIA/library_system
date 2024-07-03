export function getSchemeFields(request, scheme) {
  const result = {};

  const filterRequestObjectEntries = (requestObject, keys) =>
    Object.entries(requestObject).filter((entry) => keys.includes(entry[0]));

  for (const objectName of Object.keys(scheme)) {
    const schemeKeys = Object.keys(scheme[objectName]);

    result[objectName] = Object.fromEntries(
      filterRequestObjectEntries(request[objectName], schemeKeys)
    );
  }

  return result;
}

export function paginateValues(scheme, values) {
  if (
    !Object.hasOwn(scheme.query, 'pageSize') ||
    !Object.hasOwn(scheme.query, 'pageNumber')
  ) {
    return values;
  }

  const pageSize = scheme.query.pageSize;
  const pageNumber = scheme.query.pageNumber;

  return values.slice(pageSize * pageNumber, pageSize * (pageNumber + 1));
}
