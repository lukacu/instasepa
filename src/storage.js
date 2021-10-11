
const { v4: uuidv4 } = require('uuid');

let db = window.localStorage;

function list_items() {
    return JSON.parse(db.getItem("items") || "[]");
};

function get_property(key) {
    let properties = JSON.parse(db.getItem("properties") || "{}");
    return properties[key];
};

function set_property(key, value) {
    let properties = JSON.parse(db.getItem("properties") || "{}");

    properties[key] = value;
    
    db.setItem("properties", JSON.stringify(properties));
};

function get_item(uuid) {
    let items = list_items();
    let item = items.find(item => item.uuid == uuid);
    return item;
};

function set_item(data) {
    let items = list_items();
    if (data.uuid === undefined || data.uuid == "") data.uuid = uuidv4();
    
    let index = items.findIndex(item => item.uuid == data.uuid);
    
    if (index == -1) {
        items.push(data);
    } else {
        items[index] = data;
    }
    
    db.setItem("items", JSON.stringify(items));
    
    return index == -1;
};

function remove_item(uuid) {
    let items = list_items();
    let index = items.findIndex(item => item.uuid == uuid);
    
    if (index != -1) {
        items.splice(index, 1);
        db.setItem("items", JSON.stringify(items));
        return true;
    }
    
    return false;
};

export default {
    list_items,
    get_item,
    set_item,
    remove_item,
    get_property,
    set_property,
}

