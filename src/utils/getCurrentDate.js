export const getCurrentDate = () => {
  var currentDate = new Date();

  var day = String(currentDate.getDate()).padStart(2, '0');
  var month = String(currentDate.getMonth() + 1).padStart(2, '0');
  var year = currentDate.getFullYear();
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var seconds = currentDate.getSeconds();

  currentDate = `${day}/${month}/${year} - ${hours}h ${minutes}m ${seconds}s`;

  return currentDate;
};
