export const handler = async (event: any) => {
  const { resource, path, httpMethod, headers, queryStringParameters, body } =
    event;
  const response = {
    resource,
    path,
    httpMethod,
    headers,
    queryStringParameters,
    body,
  };
  return {
    body: JSON.stringify(response, null, 2),
    statusCode: 200,
  };
};
