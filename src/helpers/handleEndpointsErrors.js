/** @param {Error} error
 * @param {express.Request} req
 * @param {express.Response} res
 * */
export async function handleEndpointsErrors (error, req, res) {
    console.log(error.name);
    console.log(error.message);
    console.log(error.stack);
    res.status(500).send('Internal server error');
}
