export function getSchemeFields(request, scheme) {
  const result = {};

  const filterRequestObjectEntries = (requestObject, keys) =>
    Object.entries(requestObject).filter((entry) => keys.includes(entry[0]));

  for (const objectName in Object.keys(scheme)) {
    const schemeKeys = Object.keys(scheme[objectName]);

    result[objectName] = Object.fromEntries(
      filterRequestObjectEntries(request[objectName], schemeKeys)
    );
  }

  return result;
}
