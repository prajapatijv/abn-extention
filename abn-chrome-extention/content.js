// Listen for messages
chrome.runtime.onMessage.addListener(receiver);

// A message is received
function receiver(request, sender, sendResponse) {
    console.log(request);

    switch(request.action) {
        case 'load':
            load(sendResponse);
            break;
        case 'select':
            selectAbn(request);
            break;
        case 'add':
            addAbn(request, sendResponse);
            break;
        case 'delete':
            removeAbn(request, sendResponse);
            break;
        default:
    }

    return true;
}

function selectAbn(request) {
    const input = document.activeElement;

    if (input.type === "text" || input.type === "tel") {
        input.value = "";
        input.value = request.abn.replace(/ /g, '');
        input.dispatchEvent(new Event('input', { bubbles: true }))
    }
}

function addAbn(request, callback) {
    load(function(data){
        var items = data !== undefined ? data : [];
        
        if (items.find(i => i.abn === request.abn)) {
            return callback(null);
        }

        items.push(request);
        chrome.storage.sync.set({ 'abnDataSource' : items }, function() {
            console.log('saved');
            return callback(request);
        });
    }) 
}

function removeAbn(request, callback) {
    load(function(data){
        var items = data !== undefined ? data : [];
        var filteredItems = items.filter(function(ele){
            return ele.abn != request.abn;
        });
        chrome.storage.sync.set({ 'abnDataSource' : filteredItems }, function() {
            console.log('saved');
            return callback(request);
        });

    })
}

function load(callback) {
    chrome.storage.sync.get(['abnDataSource'], function (result) {
        console.log('loaded');
        return callback(result.abnDataSource)
    });
}
