const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db ;
var request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
     db = event.target.result;
   db.createObjectStore("pending",{autoIncrement: true})

    };
request.onsuccess = function(event) {
     db = event.target.result;
    if(navigator.onLine){
        checkDatabase();
    }
};
request.onerror = function(event) {
    console.error("Error: " + event.target.errorCode);
  };

function saveRecord(record){
    var transaction = db.transaction(['pending'],'readwrite')
    var store = transaction.objectStore('pending')
    store.add(record)
}

function checkDatabase() {
    console.log('Database being checked')
    var transaction = db.transaction(['pending'],'readwrite')
    var store = transaction.objectStore('pending')
    const allTransactions = store.getAll();

    allTransactions.onsuccess = function(){
        if(allTransactions.result.length > 0){
            console.log('Transactions added...')
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(allTransactions.result),
                headers: {
                  Accept: "application/json, text/plain, */*",
                  "Content-Type": "application/json"
                }
              })
                .then(response => {
                    var transaction = db.transaction(['pending'], 'readwrite')
                    var store = transaction.objectStore('pending')
                    store.clear()
                    return response.json();
                })
        }
    }
}

function addOfflineTransactions() {

    var transaction = db.transaction(['pending'], 'readwrite');
    var store = transaction.objectStore('pending');
    const allTransactions = store.getAll();               
  
    allTransactions.onsuccess = function() {
      if (allTransactions.result.length > 0) {
          allTransactions.result.forEach(temp=>{
              transactions.unshift(temp);
          })
      }
      populateTotal();
      populateTable(); 
      populateChart(); 
  
    };
  }

window.addEventListener('online', checkDatabase);


