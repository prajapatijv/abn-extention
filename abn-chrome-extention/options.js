document.addEventListener('DOMContentLoaded', function () {
    init();
}, false);


function load(callback) {
    chrome.storage.sync.get(['abnDataSource'], function (result) {
        console.log('loaded');
        return callback(result.abnDataSource)
        //return callback({'foo':'bar'});

    });
}

const GUID = '544877c1-21ca-4a04-8f38-e2bd11b4cc81';

const seachAbn = (abn) => {
    fetch(`https://abr.business.gov.au/json/AbnDetails.aspx?abn=${abn}&callback=callback&guid=${GUID}`)
        .then((response) => {
            return response.text();
        })
        .then((response) => {
            var json = response.replace("callback(", "").replace(")", "")
            onSearch(JSON.parse(json));
        });
}

const onSearch = (response) => {
    console.log(response);
}

const init = () => {
    document.getElementById('btnSearch').addEventListener('click', function () {
        var abn = document.getElementById('inputAbn').value;
        seachAbn(abn);
    });

    document.getElementById('result').innerHTML = tmpl('tmpl-demo', data)
}
