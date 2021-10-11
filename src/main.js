const version = "0.0.1";

const $ = require("jquery");
const { printf } = require('fast-printf');
const IBAN = require('iban');

import { Encoder, QRByte, QRKanji, ErrorCorrectionLevel } from '@nuintun/qrcode';
 
import {encode as encode_iso88592} from 'iso-8859-2';
 
import storage from './storage.js'
 
import QrScanner from 'qr-scanner';
QrScanner.WORKER_PATH = './worker.js'
 
require('bootstrap');
require('bootstrap/js/dist/tab');
require('bootstrap/js/dist/util');
require('bootstrap/dist/css/bootstrap.min.css');
require('bootstrap-icons/font/bootstrap-icons.css');
require('./style/main.css')

let default_item = {
    amount: "",
    due_date: "",
    iban: "",
    payer_address: "",
    payer_name: "",
    payer_post: "",
    purpose_text: "",
    receiver_address: "",
    receiver_name: "",
    receiver_post: "",
    reference: "SI99",
    urgent: false,
};


function generate_upnqr(data, callback) {

    let payload = [
        'UPNQR',
        '',
        '    ',
        '',
        '',
        data.payer_name || '',
        data.payer_address || '',
        data.payer_post || '',
        printf('%011d', data.amount * 100),
        '',
        '',
        data.purpose_code || '',
        data.purpose_text || '',
        data.due_date || '',
        (data.iban || '').replaceAll(" ", ""),
        (data.reference || '').replaceAll(" ", ""),
        data.receiver_name || '',
        data.receiver_address || '',
        data.receiver_post || '',
    ];

    payload = payload.map(function (item, index) {
        return item.trim();
    });
    
    payload = payload.join("\n") + "\n";
    payload = payload + payload.length.toString() + "\n";
    
    const qrcode = new Encoder();
     
    qrcode.setEncodingHint(true);
    qrcode.setVersion(15);
    qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.M);
     
    qrcode.write(
      new QRByte(payload, x => ({
        encoding: 4,
        bytes: Array.from(encode_iso88592(x, {mode: 'replacement'}))
      }))
    );
    qrcode.make();
     
    callback(qrcode.toDataURL(4));
}

function parse_upnqr(payload) {
    
    let lines = payload.split("\n");

    if (lines.length < 20) return null; 
    if (lines[0] != "UPNQR") return null;

    let checksum = parseInt(lines[19]);

    let data = {
        payer_name: lines[5],
        payer_address: lines[6],
        payer_post: lines[7],
        amount: parseInt(lines[8]) / 100,
        purpose_code: lines[11],
        purpose_text: lines[12],
        due_date: lines[13],
        iban: lines[14],
        reference: lines[15],
        receiver_name: lines[16],
        receiver_address: lines[17],
        receiver_post: lines[18],
    };

    return data;

}


let frontend = function() {
    
    var body_template = require("./templates/body.handlebars");
    var list_template = require("./templates/list.handlebars");
    var edit_template = require("./templates/edit.handlebars");
    var view_template = require("./templates/view.handlebars");
    var scan_template = require("./templates/scan.handlebars");
    var scanner = null;
        
    function initialize() {
        $("body").html($(body_template({version})));
        list();
    };
       
    function stop_scanner() {
        $("#bar").show();
        if (scanner) {
            scanner.stop();
        }
    }
       
    function list() {

        stop_scanner();

        let items = storage.list_items();
        let content = $(list_template({items}));

        $("#content").html(content);
        
    };

    function edit(data) {

        stop_scanner();

        let item = null;

        if (typeof(data) == "Object") {
            item = data;
        } else {
            item = storage.get_item(data);
            if (item === undefined) item = storage.get_property("defaults") || {};
        }
        
        $("#content").html($(edit_template({item})));
       
    };
    
    function scan() {

        function initialize_scanner() {
        
            let ui = $(scan_template({}));

            const video = ui.find('#video');
            const status = ui.find("#status");
            const flash = ui.find("#flash");
            const sources = ui.find("#sources");
            const close = ui.find("#close");

            close.click(function() {
                scanner.stop();
                list();
            });

            if (scanner) {
                scanner.stop();
            }

            function process_result(result) {
                let data = parse_upnqr(result);
                
                if (data) {
                    save(data);
                } 
            }

            $("#content").html(ui);

            flash.hide();
            sources.hide();

            scanner = new QrScanner(video[0], result => process_result(result), error => {
                status.text(error);
                status.addClass("error");
            });

            const updateFlashAvailability = () => {
                scanner.hasFlash().then(hasFlash => {
                    if (!hasFlash) {
                        flash.hide();
                    } else {
                        flash.show();
                        if (scanner.isFlashOn()) flash.addClass("on");
                    }
                });
            };

            scanner.start().then(() => {
                updateFlashAvailability();
                $("#bar").hide();
                sources.html("");
                scanner.setCamera(storage.get_property("camera"));
                QrScanner.listCameras(true).then((cameras) => {
                    if (cameras.length == 1) {
                        sources.hide();
                    } else {
                        cameras.forEach(camera => {
                            const option = $('<option>').attr("value", camera.id).text(camera.label);
                            option.click(() => {
                                scanner.setCamera($(event.target).val()).then(() => {
                                    updateFlashAvailability();
                                    storage.set_property("camera", $(event.target).val());
                                });
                            });
                            sources.append(option);
                        });
                        sources.show();
                    }
                });
            });


            flash.click(() => {
                scanner.toggleFlash().then(() => { if (scanner.isFlashOn()) flash.addClass("on"); else flash.removeClass("on"); });
            });

            scanner.start();
        
        }

        QrScanner.hasCamera().then(function (has) {
            if (has) {
                initialize_scanner();
            } else {
                list();
            }
        });



    };

    function save(form) {
    
        let data = form;
    
        if (form.amount === undefined) {
    
            function value(item) {
                if ($(item).attr("type") == "checkbox") return $(item).is(":checked");
                return $(item).val();
            }
        
            let properties = $(form).find("input, select").map(function (_, item) { return [[$(item).attr('id'), value(item)]]; });

            data = Object.fromEntries(properties.get());

        }

        data.iban = data.iban.replaceAll(" ", "");
    
        if (!IBAN.isValid(data.iban)) {
            edit(data);
            return;
        }
    
        let created = storage.set_item(data);
        
        if (created) {
            storage.set_property("defaults", {
                payer_address: data.payer_address,
                payer_name: data.payer_name,
                payer_post: data.payer_post,
            });
        
        }
        

        
        list();
    };
    
    function view(uuid) {

        let item = storage.get_item(uuid);
        if (item === undefined) { list(); return; };
        
        item.iban = IBAN.printFormat(item.iban); // Nice format
        
        let view = $(view_template({item}));

        $("#content").html(view);

        generate_upnqr(item, function(data) {
            view.find(".qrcode").html($("<img>").attr("src", data));
        });

    };

    function remove(uuid) {
        storage.remove_item(uuid);
        list();
    };

    return {
        initialize,
        list,
        edit,
        scan,
        view,
        save,
        remove,
    }
    
    
}();

$(function () { frontend.initialize(); window.app = frontend; });


export default frontend;

