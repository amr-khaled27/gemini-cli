function showHistory(log) {
  if (log.length > 0) {
    log.forEach((item) => {
      if (item.role == 'assistant') {
        console.log('LLaMA:', item.content);
      } else {
        console.log('user:', item.content);
      }
    });
  } else {
    console.log(`
      No History Yet!`
    );
  }
}

export { showHistory };