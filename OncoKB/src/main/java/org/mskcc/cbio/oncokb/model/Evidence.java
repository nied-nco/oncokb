package org.mskcc.cbio.oncokb.model;
// Generated Dec 19, 2013 1:33:26 AM by Hibernate Tools 3.2.1.GA

import java.util.HashSet;
import java.util.Set;



/**
 * Evidence generated by hbm2java
 */
public class Evidence implements java.io.Serializable {


    private Integer evidenceId;
    private EvidenceType evidenceType;
    private TumorType tumorType;
    private Set<Drug> drugs;
    private Gene gene;
    private Alteration alteration;
    private KnownEffectOfEvidence knownEffect;
    private LevelOfEvidence levelOfEvidence;
    private String description;
    private String genomicContext;
    private Set<Document> documents = new HashSet<Document>(0);
    private String comments;

    public Evidence() {
    }

    public Evidence(EvidenceType evidenceType) {
        this.evidenceType = evidenceType;
    }
	
    public Evidence(EvidenceType evidenceType, Alteration alteration, KnownEffectOfEvidence knownEffect) {
        this.evidenceType = evidenceType;
        this.alteration = alteration;
        this.knownEffect = knownEffect;
    }
    public Evidence(EvidenceType evidenceType, TumorType tumorType, Set<Drug> drugs, Gene gene, Alteration alteration, KnownEffectOfEvidence knownEffect, LevelOfEvidence levelOfEvidence, String description, String genomicContext, Set<Document> documents, String comments) {
        this.evidenceType = evidenceType;
        this.tumorType = tumorType;
        this.drugs = drugs;
        this.gene = gene;
        this.alteration = alteration;
        this.knownEffect = knownEffect;
        this.levelOfEvidence = levelOfEvidence;
        this.description = description;
        this.genomicContext = genomicContext;
        this.documents = documents;
        this.comments = comments;
    }
   
    
    public Integer getEvidenceId() {
        return this.evidenceId;
    }
    
    
    public void setEvidenceId(Integer evidenceId) {
        this.evidenceId = evidenceId;
    }

    public EvidenceType getEvidenceType() {
        return evidenceType;
    }

    public void setEvidenceType(EvidenceType evidenceType) {
        this.evidenceType = evidenceType;
    }

    public LevelOfEvidence getLevelOfEvidence() {
        return levelOfEvidence;
    }

    public void setLevelOfEvidence(LevelOfEvidence levelOfEvidence) {
        this.levelOfEvidence = levelOfEvidence;
    }
    
    public TumorType getTumorType() {
        return this.tumorType;
    }
    
    
    public void setTumorType(TumorType tumorType) {
        this.tumorType = tumorType;
    }

    public Set<Drug> getDrugs() {
        return drugs;
    }

    public void setDrugs(Set<Drug> drugs) {
        this.drugs = drugs;
    }

    public Gene getGene() {
        return gene;
    }

    public void setGene(Gene gene) {
        this.gene = gene;
    }
    
    public Alteration getAlteration() {
        return this.alteration;
    }
    
    
    public void setAlteration(Alteration alteration) {
        this.alteration = alteration;
    }
    
    public KnownEffectOfEvidence getKnownEffect() {
        return this.knownEffect;
    }
    
    
    public void setKnownEffect(KnownEffectOfEvidence knownEffect) {
        this.knownEffect = knownEffect;
    }
    
    public String getDescription() {
        return this.description;
    }
    
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getGenomicContext() {
        return this.genomicContext;
    }
    
    
    public void setGenomicContext(String genomicContext) {
        this.genomicContext = genomicContext;
    }
    
    public Set<Document> getDocuments() {
        return this.documents;
    }
    
    
    public void setDocuments(Set<Document> documents) {
        this.documents = documents;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }


}

