/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.mskcc.cbio.oncokb.importer;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import org.mskcc.cbio.oncokb.bo.DrugBo;
import org.mskcc.cbio.oncokb.model.Drug;
import org.mskcc.cbio.oncokb.util.ApplicationContextSingleton;
import org.mskcc.cbio.oncokb.util.FileUtils;

/**
 *
 * @author jgao
 */
public class PiHelperDrugImporter {
    private PiHelperDrugImporter() {
        throw new AssertionError();
    }
    
    private static final String DRUG_FILE = "/Users/zhangh2/Desktop/INFO_SITES/oncokb/drugs.tsv";
    
    public static void main(String[] args) throws IOException {
        List<String> lines = FileUtils.readTrimedLinesStream(
                new FileInputStream(DRUG_FILE));
	
    	DrugBo drugBo = ApplicationContextSingleton.getDrugBo();
        
        System.out.println("importing...");
        int i = 0;
        while (lines.get(i).startsWith("#")) {
            i++;
        }
        
        i++; // header
        
        int nLines = lines.size();
        for (; i<nLines; i++) {
            System.out.println("Processing.. "+i+"/"+nLines);
            String line = lines.get(i);
            
            String[] parts = line.split(" *\"?\t\"? *");
            
            String name = parts[1];
            if (drugBo.findDrugByName(name)!=null) {
                System.err.println("Error: duplicated drug "+name);
                continue;
            }
            
            String synonyms = parts[2];
            String description = parts[3];
            String atcCodes = parts[5];
            String fdaApproved = parts[6];
            
            Drug drug = new Drug();
            drug.setDrugName(name);
            if (!synonyms.isEmpty()) {
                drug.setSynonyms(new HashSet<String>(Arrays.asList(synonyms.split(";"))));
            }
            drug.setDescription(description);
            drug.setAtcCodes(new HashSet<String>(Arrays.asList(atcCodes.split(";"))));
            drug.setFdaApproved(Boolean.valueOf(fdaApproved));
            
            drugBo.save(drug);
        }
        
    }
}
