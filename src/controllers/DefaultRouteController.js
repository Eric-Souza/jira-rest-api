export const DefaultRouteController = (req, res) => {
  return res.send(
    `<div>
      <h2> Hello! You have reached the default route. </h2>
      <p> To use the API, please refer to one of the following routes: </p>

      <ul>
        <li>/issues - Get all issues by board id and generate a Google Sheet with its data</li>
      </ul>
    </div>`
  );
};
