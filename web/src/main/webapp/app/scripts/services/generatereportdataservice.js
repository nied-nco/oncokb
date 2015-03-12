'use strict';

/**
 * @ngdoc service
 * @name webappApp.GenerateReportDataService
 * @description
 * # GenerateReportDataService
 * Factory in the webappApp.
 */
angular.module('webappApp')
  .factory('GenerateReportDataService', function () {
    var specialKeyChars = '#$%';
    
    function generateReportData(geneName, alteration, tumorType, relevantCancerType, annotation) {
        var params = {
            "email": "",
            "patientName": "",
            "specimen": "",
            "clientNum": "",
            "overallInterpretation": "",
            "diagnosis": "",
            "tumorTissueType": "",
            "specimenSource": "None.",
            "blockId": "None.",
            "stage": "None.",
            "grade": "None.",
            "geneName": "",
            "mutation": "",
            "alterType": "N/A",
            "mutationFreq": "N/A",
            "tumorTypeDrugs": "N/A",
            "nonTumorTypeDrugs": "N/A",
            "hasClinicalTrial": "N/A",
            'additionalMutations': 'None.',
            'interactingMutations': 'None.',
            "treatment": "None.",
            "fdaApprovedInTumor": "None.",
            "fdaApprovedInOtherTumor": "None.",
            "clinicalTrials": "None.",
            "additionalInfo": "None.",
            "companionDiagnostics": "None."
        };
        
        var _clinicalTrail = constructClinicalTrial(annotation, geneName, alteration, tumorType, relevantCancerType);
        params.hasClinicalTrial = 'NO';
        if(_clinicalTrail.length > 0) {
            for(var i =0; i < _clinicalTrail.length; i++) {
                if(_clinicalTrail[i].hasOwnProperty('CLINICAL TRIALS MATCHED FOR GENE AND DISEASE')
                    && _clinicalTrail[i]['CLINICAL TRIALS MATCHED FOR GENE AND DISEASE'].length > 0) {
                    params.hasClinicalTrial = 'YES';
                    break;
                }
            }
            params.clinicalTrials = _clinicalTrail;
        }else {
            params.clinicalTrials = 'None.';
        }
        
        if(params.hasClinicalTrial === 'NO') {
            annotation.annotation_summary = annotation.annotation_summary.toString().replace('Please refer to the clinical trials section.', '');
        }
        
        params.overallInterpretation = (geneName + ' ' + alteration + ' SUMMARY\n' + 
            annotation.annotation_summary + 
            '\nOTHER GENES\nNo additional somatic mutations were detected in this patient sample in the other sequenced gene regions.') || 'None.';
        params.geneName = geneName;
        params.mutation = alteration;
        params.diagnosis = tumorType;
        params.tumorTissueType = params.diagnosis;
        var _treatment = constructTreatment(annotation, geneName, alteration, tumorType, relevantCancerType);
        params.treatment = _treatment.length > 0 ? _treatment : "None.";
        
        var _fdaInfo = constructfdaInfo(annotation, geneName, alteration, tumorType, relevantCancerType);
        if(_fdaInfo.approved.length > 0) {
            params.tumorTypeDrugs = 'YES';
            params.fdaApprovedInTumor = _fdaInfo.approved;
        }else {
            params.tumorTypeDrugs = 'NO';
            params.fdaApprovedInTumor = 'None.';
        }
        if(_fdaInfo.approvedInOther.length > 0) {
            params.nonTumorTypeDrugs = 'YES';
            params.fdaApprovedInOtherTumor = _fdaInfo.approvedInOther;
        }else {
            params.nonTumorTypeDrugs = 'NO';
            params.fdaApprovedInOtherTumor = 'None.';
        }
        
        var _additionalInfo = constructAdditionalInfo(annotation, geneName, alteration, tumorType, relevantCancerType);
        params.additionalInfo = _additionalInfo.length > 0 ? _additionalInfo : "None.";
        
        //Set the alteration type to MUTATION, need to change after type available
        params.alterType = 'MUTATION';
        return params;
    }


    function constructTreatment(annotation, geneName, mutation, tumorType, relevantCancerType) {
        var treatment = [],
            key = '',
            value = [],
            object = {},
            cancerTypeInfo = relevantCancerType || {};

        if(annotation.annotation_summary) {
            key = geneName + ' ' + mutation + " SUMMARY";
            value.push({'description': annotation.annotation_summary});
            object[key] = value;
            treatment.push(object);
        }

        if(cancerTypeInfo.nccn_guidelines) {
            var _datum = cancerTypeInfo.nccn_guidelines;
            var versions = {};

            value = [];
            object = {};
            key = "NCCN GUIDELINES";
            for(var i=0, _datumL = _datum.length; i < _datumL; i++) {
                if(!versions.hasOwnProperty(_datum[i].version)) {
                    versions[_datum[i].version] = {};
                }
            }
            
            for(var i=0, _datumL = _datum.length; i < _datumL; i++) {
                if(checkDescription(_datum[i])) {
                    versions[_datum[i].version]['recommendation category'] = _datum[i].description;
                }
            }

            for(var versionKey in versions) {
                var version = versions[versionKey];
                version.nccn_special = 'Version: ' + versionKey + ', Cancer type: ' + tumorType;
                value.push(version);
            }
            
            object[key] = value;
            treatment.push(object);
        }
        
        if(cancerTypeInfo.standard_therapeutic_implications && cancerTypeInfo.standard_therapeutic_implications.general_statement && checkDescription(cancerTypeInfo.standard_therapeutic_implications.general_statement.sensitivity)) {
            var description = cancerTypeInfo.standard_therapeutic_implications.general_statement.sensitivity.description;
            value = [];
            object = {};
            key = "STANDARD THERAPEUTIC IMPLICATIONS";
            if(typeof description === 'string') {
                description = description.trim();
            }
            value.push({'description': cancerTypeInfo.standard_therapeutic_implications.general_statement.sensitivity.description});
            object[key] = value;
            treatment.push(object);
        }
        
        if(cancerTypeInfo.prognostic_implications && checkDescription(cancerTypeInfo.prognostic_implications)) {
            var description = cancerTypeInfo.prognostic_implications.description;
            value = [];
            key = "PROGNOSTIC IMPLICATIONS";
            object = {};
            if(angular.isString(description)) {
                description = description.trim();
            }else {
                if(angular.isArray(description)){
                    var str = [];
                    description.forEach(function(e,i){
                        if(e['Cancer type'].toString().toLowerCase() === 'all tumors' && str.length > 0) {
                            str.unshift(e.value.toString().trim());
                        }else {
                            str.push(e.value.toString().trim());
                        }
                    });
                    description = str.join(' ');
                }else{
                    description = '';
                    console.log('PROGNOSTIC IMPLICATIONS --- not string --- not array');
                }
            }
            value.push({'description': description});
            object[key] = value;
            treatment.push(object);
        }

        return treatment;
    }

    function findApprovedDrug(datum, object, tumorType, key, valueExtend) {
        for(var m=0, datumL = datum.length; m < datumL; m++) {
            var _subDatum = datum[m],
                _key = '',
                _obj = {},
                _level;

            if(typeof key !== 'undefined') {
                _key = key;
            }

            if(_subDatum.treatment) {
                for (var i = 0; i < _subDatum.treatment.length; i++) {
                    var _treatment = _subDatum.treatment[i];
                    if(_treatment.drug) {
                        for (var j = 0; j < _treatment.drug.length; j++) {
                            var _drug = _treatment.drug[j];
                            if(_drug.fda_approved === 'Yes') {
                                _key+=_drug.name + ' + ';
                            }
                        };
                    }
                    _key = _key.substr(0, _key.length-3);
                    _key += ', ';
                }
            }

            _key = _key.substr(0, _key.length-2);
            
            if(valueExtend !== undefined) {
                _key += valueExtend;
            }
            
            while(object.hasOwnProperty(_key)) {
                _key+=specialKeyChars;
            }
                    
            if(_subDatum.level_of_evidence_for_patient_indication && _subDatum.level_of_evidence_for_patient_indication.level) {
                _level = _subDatum.level_of_evidence_for_patient_indication.level;
                _obj['Level of evidence'] = isNaN(_level)?_level.toUpperCase():_level;
            }
            if(checkDescription(_subDatum)) {
                _obj.description = _subDatum.description;
            }
            if(typeof tumorType !== "undefined" && tumorType !== "") {
                _obj['Cancer Type']= tumorType;
            }
            object[_key] = [_obj];
        }

        return object;
    }

    function findByLevelEvidence(datum, object, tumorType, key, valueExtend) {
        for(var m=0, datumL = datum.length; m < datumL; m++) {
            var _subDatum = datum[m],
                _key = '',
                _obj = {},
                _level;

            if(typeof key !== 'undefined') {
                _key = key;
            }
            
            if(_subDatum.treatment) {
                for (var i = 0; i < _subDatum.treatment.length; i++) {
                    var _treatment = _subDatum.treatment[i];
                    if(_treatment.drug) {
                        for (var j = 0; j < _treatment.drug.length; j++) {
                            var _drug = _treatment.drug[j];
                                _key+=_drug.name + ' + ';
                        };
                    }

                    _key = _key.substr(0, _key.length-3);
                    _key += ', ';
                }
            }

            _key = _key.substr(0, _key.length-2);
            
            if(valueExtend !== undefined) {
                _key += valueExtend;
            }
            
            while(object.hasOwnProperty(_key)) {
                _key+=specialKeyChars;
            }

            if(_subDatum.level_of_evidence_for_patient_indication && _subDatum.level_of_evidence_for_patient_indication.level) {
                _level = _subDatum.level_of_evidence_for_patient_indication.level;
                _obj['Level of evidence'] = isNaN(_level)?_level.toUpperCase():_level;
            }
            if(checkDescription(_subDatum)) {
                _obj.description = _subDatum.description;
            }
            if(typeof tumorType !== "undefined" && tumorType !== "") {
                _obj['Cancer Type']= tumorType;
            }
            object[_key] = [_obj];
        }
        return object;
    }

    function displayProcess(str) {
        var specialUpperCasesWords = ['NCCN'];
        var specialLowerCasesWords = ['of', 'for', 'to'];

        str = str.replace(/_/g, ' ');
        str = str.replace(
            /\w\S*/g,
            function(txt) {
                var _upperCase = txt.toUpperCase(),
                    _lowerCase = txt.toLowerCase();

                if( specialUpperCasesWords.indexOf(_upperCase) !== -1 ) {
                    return _upperCase;
                }

                if( specialLowerCasesWords.indexOf(_lowerCase) !== -1 ) {
                    return _lowerCase;
                }

                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
        return str;
    }

    function constructfdaInfo(annotation, geneName, mutation, tumorType, relevantCancerType) {
        var fdaApproved = [],
            fdaApprovedInOther = [],
            object = {},
            cancerTypeInfo = relevantCancerType || {},
            attrsToDisplay = ['sensitive_to', 'resistant_to'];

        if(cancerTypeInfo.standard_therapeutic_implications) {
            for (var i = 0; i < attrsToDisplay.length; i++) {
                if(cancerTypeInfo.standard_therapeutic_implications[attrsToDisplay[i]]) {
                    var _datum = cancerTypeInfo.standard_therapeutic_implications[attrsToDisplay[i]];
                    
                    object = {};
                    if(attrsToDisplay[i] === 'sensitive_to') {
                        object = findApprovedDrug(_datum, object);
                    }else if(attrsToDisplay[j] === 'resistant_to'){
                        object = findByLevelEvidence(_datum, object, '', '', " (Resistance)");
                    }else {
                        object = findApprovedDrug(_datum, object, '', displayProcess(attrsToDisplay[i]) + ': ');
                    }

                    for(var _key in object) {
                        var _object = {};
                        _object[_key] = object[_key];
                        fdaApproved.push(_object);
                        _object = null;
                    }
                }
            }
        }
        
        if(annotation.cancer_type && relevantCancerType && relevantCancerType.$type) {
            object = {};

            for (var i = 0; i < annotation.cancer_type.length; i++) {
                if(isNRCT(relevantCancerType.$type, annotation.cancer_type[i].$type)) {
                    if(annotation.cancer_type[i].standard_therapeutic_implications) {
                        for (var j = 0; j < attrsToDisplay.length; j++) {
                            if(annotation.cancer_type[i].standard_therapeutic_implications[attrsToDisplay[j]]) {
                                var _datum = annotation.cancer_type[i].standard_therapeutic_implications[attrsToDisplay[j]];
                                if(attrsToDisplay[j] === 'sensitive_to') {
                                    object = findApprovedDrug(_datum, object, annotation.cancer_type[i].$type);
                                }else if(attrsToDisplay[j] === 'resistant_to'){
                                    object = findByLevelEvidence(_datum, object, '', '', " (Resistance)");
                                }else {
                                    object = findApprovedDrug(_datum, object, annotation.cancer_type[i].$type, attrsToDisplay[j] + ': ');
                                }
                            }
                        }
                    }
                }
            }

            for(var _key in object) {
                var _object = {};
                _object[_key] = object[_key];
                
                for(var i = 0; i < _object[_key].length; i++ ) {
                    delete _object[_key][i]['Level of evidence'];
                    delete _object[_key][i]['description'];
                }
                
                fdaApprovedInOther.push(_object);
                _object = null;
            }
        }
        return {'approved': fdaApproved, 'approvedInOther': fdaApprovedInOther};
    }
    
    //Is not relevant cancer type
    function isNRCT(relevent, type) {
        if(typeof relevent === 'object') {
            if(relevent instanceof Array) {
                for(var i=0; i<relevent.length; i++) {
                    if(relevent[i]['Cancer type'] === type) {
                        return false;
                    }
                }
                return true;
            }else {
                if(relevent.type === type) {
                    return false;
                }else {
                    return true;
                }
            }
        }else {
            return null;
        }
    }
    
    function constructClinicalTrial(annotation, geneName, mutation, tumorType, relevantCancerType) {
        var clincialTrials = [],
            key = '',
            value = [],
            object = {},
            cancerTypeInfo = relevantCancerType || {},
            attrsToDisplay = ['resistant_to', 'sensitive_to'];

        if(cancerTypeInfo.clinical_trial) {
            var _datum = cancerTypeInfo.clinical_trial;

            value = [];
            object = {};
            key = "CLINICAL TRIALS MATCHED FOR GENE AND DISEASE";

            for(var i=0, _datumL = _datum.length; i < _datumL; i++) {
                    var _subDatum = {},
                        _phase = _datum[i].phase || '';

                    if(_phase.indexOf('/') !== -1 && _phase !== 'N/A') {
                        var _phases = _phase.split('/');
                        _phases.forEach(function(e, i, array){
                            array[i] = e.replace(/phase/gi, '').trim();
                        });
                         
                        _phase = 'Phase ' + _phases.sort().join('/');
                    }
                    _subDatum.trial = _datum[i].trial_id + (_phase!==''?(', ' + _phase):'');
                    _subDatum.title = _datum[i].title;
                    if(checkDescription(_subDatum)) {
                        _subDatum.description = removeCharsInDescription(_datum[i].description);
                    }
                    value.push(_subDatum);
            }
            
            object[key] = value;
            clincialTrials.push(object);
        }

        if(cancerTypeInfo.investigational_therapeutic_implications) {
            var hasdrugs = false;
            if(cancerTypeInfo.investigational_therapeutic_implications.general_statement) {
                value = [];
                object = {};
                key = "INVESTIGATIONAL THERAPEUTIC IMPLICATIONS";
                object[key] = addRecord({'array': ['Cancer type', 'value'], 'object':'description'}, cancerTypeInfo.investigational_therapeutic_implications.general_statement.sensitivity.description, value);
            
                clincialTrials.push(object);
            }else if(Object.keys(cancerTypeInfo.investigational_therapeutic_implications).length > 0){
                clincialTrials.push({"INVESTIGATIONAL THERAPEUTIC IMPLICATIONS": []});
            }
            
            for (var j = 0; j < attrsToDisplay.length; j++) {
                if(cancerTypeInfo.investigational_therapeutic_implications[attrsToDisplay[j]]) {
                    object = {};
                    if(attrsToDisplay[j] === 'sensitive_to') {
                        object = findByLevelEvidence(cancerTypeInfo.investigational_therapeutic_implications[attrsToDisplay[j]], object);
                    }else if(attrsToDisplay[j] === 'resistant_to'){
                        object = findByLevelEvidence(cancerTypeInfo.investigational_therapeutic_implications[attrsToDisplay[j]], object, '', '', " (Resistance)");
                    }else {
                        object = findByLevelEvidence(cancerTypeInfo.investigational_therapeutic_implications[attrsToDisplay[j]], object, '', displayProcess(attrsToDisplay[j]) + ': ');
                    }
                    if(Object.keys(object).length > 0) {
                        hasdrugs = true;
                    }
                    for(var _key in object) {
                        var _object = {},
                            _newKey = _key.replace(specialKeyChars, '');
                        _object[_newKey] = object[_key];
                        clincialTrials.push(_object);
                        _object = null;
                    }
                }
            }

            if(!hasdrugs) {
                if(!cancerTypeInfo.investigational_therapeutic_implications.general_statement) {
                    value = [];
                    object = {};
                    key = "INVESTIGATIONAL THERAPEUTIC IMPLICATIONS";
                    value.push({'description': 'There are no investigational therapies that meet level 1, 2 or 3 evidence.'});
                    object[key] = value;
                    clincialTrials.push(object);
                }else {
                    clincialTrials.push({'no_evidence': 'There are no investigational therapies that meet level 1, 2 or 3 evidence.'});
                }
            }

            object = {};
            key = 'LEVELS OF EVIDENCE';
            value =  [
                {'level 1': 'FDA-approved biomarker and drug association in this indication.'},
                {'level 2A': 'FDA-approved biomarker and drug association in another indication, and NCCN-compendium listed for this indication.'},
                {'level 2B': 'FDA-approved biomarker in another indication, but not FDA or NCCN-compendium-listed for this indication.'},
                {'level 3': 'Clinical evidence links this biomarker to drug response but no FDA-approved or NCCN compendium-listed biomarker and drug association.'},
                {'level 4': 'Preclinical evidence potentially links this biomarker to response but no FDA-approved or NCCN compendium-listed biomarker and drug association.'}
            ];
            object[key] = value;
            clincialTrials.push(object);
        }
        return clincialTrials;
    }

    function addRecord(keys, value, array) {
        if(Array.isArray(value)) {
            value.forEach(function(e, i) {
                var _obj = {};
                keys.array.forEach(function(e1, i1) {
                    _obj[e1] = removeCharsInDescription(e[e1]);
                });
                array.push(_obj);
            });
        }else {
            var _obj = {};
            _obj[keys.object] = removeCharsInDescription(value);
            array.push(_obj);
        }
        return array;
    }
    
    function checkDescription(datum) {
        if(datum && datum.hasOwnProperty('description') && (angular.isString(datum.description) || datum.description instanceof Array)) {
            return true;
        }else {
            return false;
        }
    }
    
    function constructAdditionalInfo(annotation, geneName, mutation, tumorType, relevantCancerType) {
        var additionalInfo = [],
            key = '',
            value = [],
            object = {},
            cancerTypeInfo = relevantCancerType || {};

        if(annotation.gene_annotation && checkDescription(annotation.gene_annotation)) {
            value = [];
            key = 'BACKGROUND';
            object = {};
            value.push({'description': removeCharsInDescription(annotation.gene_annotation.description)});
            object[key] = value;
            additionalInfo.push(object);
        }

        if(cancerTypeInfo.prevalence) {
            value = [];
            key = 'MUTATION PREVALENCE';
            object = {};
            object[key] = addRecord({'array': ['value'], 'object':'description'}, cancerTypeInfo.prevalence.description, value);
            additionalInfo.push(object);
        }

        if(annotation.variant_effect) {
            value = [];
            key = 'MUTATION EFFECT';
            object = {};
            value.push({
                'effect': annotation.variant_effect.effect || '',
                'description': annotation.variant_effect.description? removeCharsInDescription(annotation.variant_effect.description) : ''
            });
            object[key] = value;
            additionalInfo.push(object);
        }
        return additionalInfo;
    }

    function removeCharsInDescription(str) {
        if(typeof str !== 'undefined') {
            str = str.trim();
            str = str.replace(/(\r\n|\n|\r)/gm,'');
            str = str.replace(/(\s\s*)/g,' ');
            return str;
        }else {
            return '';
        }
    }
    // Public API here
    return {
      init: generateReportData
    };
  });
