function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
}

function getDateTime(){
  const currentDate = new Date()
  const data = {
    date: currentDate.toLocaleDateString(),
    time: currentDate.toLocaleTimeString()
  }
  return data
}

module.exports = {
  getDateTime,
  generateRandomString
}