document.addEventListener('DOMContentLoaded', function () {

  loadAbnList(loadAbnListCallback);
  /*
  document.getElementById('btnOptions').addEventListener('click', function () {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });*/
  
  document.getElementById('btnAdd').addEventListener('click', function () {
    const abn = document.getElementById('abn').value;
    tryAddAbn(abn);
  });

}, false);


const bindAbnList = (list) => {
  var abnlist = document.getElementById("abn-list");

  list.forEach(item => {
    const abnBtn = document.createElement('button');
    abnBtn.innerHTML = item.entityName + ' - ' + item.abn;
    abnBtn.value = item.abn;
    abnBtn.className = 'button';

    const abnDelete = document.createElement('button');
    abnDelete.innerHTML = 'X';
    abnDelete.value = item.abn;
    abnDelete.className = 'button-primary';

    abnBtn.onclick = (event) => {
      var msg = {
        from: 'popup',
        action: 'select',
        abn: event.target.value
      }

      sendMessage(msg);
      window.close();
    }

    abnDelete.onclick = (event) => {
      var msg = {
        from: 'popup',
        action: 'delete',
        abn: event.target.value
      }

      sendMessage(msg);
    }
    
    abnlist.append(abnBtn);
    abnlist.append(abnDelete);
  });
}

const tryAddAbn = (abn) => {
  seachAbn(abn);
}

const seachAbn = (abn) => {
  const GUID = '544877c1-21ca-4a04-8f38-e2bd11b4cc81';
  fetch(`https://abr.business.gov.au/json/AbnDetails.aspx?abn=${abn}&callback=callback&guid=${GUID}`)
      .then((response) => {
          return response.text();
      })
      .then((response) => {
          var json = response.replace("callback(", "").replace(")", "")
          onSearch(JSON.parse(json));
      });
}




/* Message Passing*/
const onSearch = (response) => {
  var msg = {
    from: 'popup',
    action: 'add',
    abn: response.Abn,
    status: response.AbnStatus,
    entityName: response.EntityName,
  }

  sendMessage(msg);
}

const loadAbnList = (callback) => {
  var msg = {
    from: 'popup',
    action: 'load'
  }

  sendMessage(msg, callback);
}
const loadAbnListCallback = (list) => {
  console.log(list);
  bindAbnList(list);
}


const sendMessage = (message, callback) => {
  var params = {
    active: true,
    currentWindow: true
  };

  // This searches for the active tabs in the current window
  chrome.tabs.query(params, gotTabs);

  // Now we've got the tabs
  function gotTabs(tabs) {
    // The first tab is the one you are on
    chrome.tabs.sendMessage(tabs[0].id, message, callback);
  }
}