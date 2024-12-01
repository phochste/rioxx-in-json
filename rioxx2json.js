const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const file = process.argv[2];

if (!file || ! fs.existsSync(file)) {
    console.error("usage: rioxx2json.js file");
    process.exit(1);
}

const xml = fs.readFileSync(file,'utf8');

xml2js.parseString(xml, (err, result) =>{
    const json = {
        '@context': 'https://labs.eventnotifications.net/contexts/rioxx.jsonld',
        'id': 'file://' + path.resolve(file)
    };
    for (const [key, value] of Object.entries(result['rioxx'])) {
        if (key === 'dc:description') {
            json['dc:description'] = value;
        }
        else if (key === 'dc:language') {
            json['dc:language'] = value;
        }
        else if (key === 'dc:coverage') {
            json['dc:coverage'] = value;
        }
        else if (key === 'dc:source') {
            json['dc:source'] = value;
        }
        else if (key === 'dc:subject') {
            json['dc:subject'] = value;
        }
        else if (key === 'dc:title') {
            json['dc:title'] = value[0];
        }
        else if (key === 'dcterms:dateAccepted') {
            json['dcterms:dateAccepted'] = value[0];
        }
        else if (key === 'dc:type') {
            json['dc:type'] = value;
        }
        else if (key === 'dc:identifier') {
            json['dc:identifier'] = value[0];
        }
        else if (key === 'dc:relation') {
            json['dc:relation'] = [];
            value.forEach( v => {
                json['dc:relation'].push(addComplex(v));
            });
        }
        else if (key === 'rioxxterms:ext_relation') {
            json['ext_relation'] = [];
            value.forEach( v => {
                json['ext_relation'].push(addComplex(v));
            });
        }
        else if (key === 'rioxxterms:grant') {
            json['grant'] = [];
            value.forEach( v => {
                json['grant'].push(addComplex(v));
            });
        }
        else if (key === 'rioxxterms:project') {
            json['project'] = [];
            value.forEach( v => {
                json['project'].push(addComplex(v));
            });
        }
        else if (key === 'rioxxterms:publication_date') {
            json['publication_date'] = value[0];
        }
        else if (key === 'rioxxterms:publisher') {
            json['publisher'] = [];
            value.forEach( v => {
                const pub = {};
                if (v['rioxxterms:id']) {
                    pub['id'] = v['rioxxterms:id'][0];
                }
                if (v['rioxxterms:name']) {
                    pub['name'] = v['rioxxterms:name'][0];
                }
                json['publisher'].push(pub);
            });
        }
        else if (key === 'rioxxterms:record_public_release_date') {
            json['record_public_release_date'] = value[0];
        }
        else if (key === 'rioxxterms:creator') {
            json['creator'] = [];
            value.forEach( v => {
                const cre = {};
                if (v['rioxxterms:id']) {
                    cre['id'] = v['rioxxterms:id'][0];
                }
                if (v['rioxxterms:name']) {
                    cre['name'] = v['rioxxterms:name'][0];
                }
                if (v['$'] && v['$']['first-named-author']) {
                    cre['first-named-author'] = (/true/).test((v['$']['first-named-author']));
                }
                json['creator'].push(cre);
            });
        }
        else if (key === 'rioxxterms:contributor') {
            json['contributor'] = [];
            value.forEach( v => {
                const cre = {};
                if (v['rioxxterms:id']) {
                    cre['id'] = v['rioxxterms:id'][0];
                }
                if (v['rioxxterms:name']) {
                    cre['name'] = v['rioxxterms:name'][0];
                }
                if (v['$'] && v['$']['first-named-author']) {
                    cre['first-named-author'] = (/true/).test((v['$']['first-named-author']));
                }
                json['contributor'].push(cre);
            });
        }
    }
    console.log(JSON.stringify(json,null,2));
});

function addComplex(value) {
    const complex = {};
    if (value['_']) {
        complex['value'] = value['_'].replace(/\s+/g,'');
        if (complex['value'].match(/^http(s)?:\//)) {
            complex['value'] = {
                'id': complex['value']
            };
        }
    }
    if (value['$']) {
        for (const [k, v] of Object.entries(value['$'])) {
            complex[k] = v;
        }
    }
    
    return complex;
}