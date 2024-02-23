export function errorDecorator (endpointHandler) {
    return (request, response) => {
        try {
            endpointHandler(request, response);
        } catch (e) {
            response.status(500).json('oops...');
            console.log(e);
        }
    };
}
