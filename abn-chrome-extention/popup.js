document.addEventListener('DOMContentLoaded', function () {

  loadAbnList(loadAbnListCallback);
  
  document.getElementById('btnAdd').addEventListener('click', function () {
    const abn = document.getElementById('abn').value;
    tryAddAbn(abn);
  });

}, false);


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
  debugger
  var msg = {
    from: 'popup',
    action: 'add',
    abn: response.Abn,
    status: response.AbnStatus,
    entityName: response.EntityName,
  }

  sendMessage(msg, onAdded);
}

const onAdded = (data) => {
  loadAbnListCallback([data]);
}


//LoadAbn
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

//Bind DOM
const bindAbnList = (list) => {
  var abnlist = document.getElementById("abn-list");

  if (null === list || undefined === list) {
    const label = document.createElement('label');
    label.innerHTML = "Please add ABN numbers";
    abnlist.append(label);
    return;
  }

  list.forEach(item => {
    const div = document.createElement('div');
    div.className = item.abn;

    const abnBtn = document.createElement('button');
    abnBtn.innerHTML = item.abn;
    abnBtn.value = item.abn;
    const statusClass = item.status.toLowerCase() === 'active' ? 'abn-active' : '';
    abnBtn.className = `button button-abn ${statusClass}`;

    const abnDelete = document.createElement('button');
    abnDelete.innerHTML = 'X';
    abnDelete.value = item.abn;
    abnDelete.className = 'button button-x';

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
      var item = document.getElementsByClassName(event.target.value)[0];
      abnlist.removeChild(item); 
    }
    
    div.append(abnBtn);
    div.append(abnDelete);
    
    abnlist.append(div);
  });
}