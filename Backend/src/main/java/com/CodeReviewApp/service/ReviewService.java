package com.CodeReviewApp.service;

import com.CodeReviewApp.model.CodeSubmission;
import com.CodeReviewApp.model.ReviewResult;
import com.CodeReviewApp.repository.ReviewResultRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewResultRepository resultRepo;

    /* --------- PMD executable & ruleset (adapt path to your system) --------- */
    private String pmdExec;
    private String ruleset;

    @PostConstruct
    private void init() {
        String os = System.getProperty("os.name").toLowerCase();
        if (os.contains("win")) {
            pmdExec = "C:\\Users\\DHANUNJAYA SOMIREDDY\\Documents\\workspace-spring-tools-for-eclipse-4.30.0.RELEASE\\CodeReviewApp_MajorPro\\pmd-bin-7.14.0\\bin\\pmd.bat";
            ruleset = "src/main/resources/pmd/ruleset.xml"; // for Windows
        } else {
            pmdExec = "pmd/bin/run.sh";
            ruleset = "src/main/resources/pmd/ruleset.xml";	 // for linux or mac

        }
    }

    /* ====================================================================== */
    /* ==========  PUBLIC ENTRY POINTS  ===================================== */
    /* ====================================================================== */

    /** Review when code arrives as raw STRING (snippet or full file content). */
    public ReviewResult analyzeSnippet(CodeSubmission submission) throws Exception {

        Path tempDir = Files.createTempDirectory("pmd_snippet_");
        Path javaFile = tempDir.resolve("Submission_" + submission.getId() + ".java");
        Files.writeString(javaFile, submission.getSubmittedCode());

        ReviewResult rr = runPmd(javaFile, false, submission);
        Files.deleteIfExists(javaFile);
        Files.deleteIfExists(tempDir);
        return rr;
    }

    /** Review an already‑stored .java file on disk. */
    public ReviewResult analyzeFile(Path javaFile, CodeSubmission submission) throws Exception {
        return runPmd(javaFile, false, submission);
    }

    /** Review an entire directory (e.g., extracted from zip). */
    public ReviewResult analyzeDirectory(Path dirPath, CodeSubmission submission) throws Exception {
        return runPmd(dirPath, true, submission);
    }
    
    public ReviewResult analyzeZip(CodeSubmission submission) throws Exception {

        byte[] zipBytes = java.util.Base64.getDecoder().decode(submission.getSubmittedCode());
        Path tempDir = Files.createTempDirectory("pmd_zip_");

        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(new java.io.ByteArrayInputStream(zipBytes))) {
            java.util.zip.ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory() && entry.getName().endsWith(".java")) {
                    Path filePath = tempDir.resolve(entry.getName());
                    Files.createDirectories(filePath.getParent());
                    Files.copy(zis, filePath, StandardCopyOption.REPLACE_EXISTING);
                }
            }
        }
        return runPmd(tempDir, true, submission);
    }
    /* ====================================================================== */
    /* ==========  INTERNAL HELPER  ========================================= */
    /* ====================================================================== */

    private ReviewResult runPmd(Path target, boolean isDir, CodeSubmission submission) throws Exception {

        if (!Files.exists(Paths.get(pmdExec))) {
            throw new IllegalStateException("PMD executable not found at " + pmdExec);
        }

        String command = String.format("\"%s\" check -d \"%s\" -f text -R %s",
                pmdExec,
                target.toAbsolutePath(),
                ruleset);

        ProcessBuilder pb = System.getProperty("os.name").toLowerCase().contains("win")
                ? new ProcessBuilder("cmd.exe", "/c", command)
                : new ProcessBuilder("/bin/sh", "-c", command);
        pb.redirectErrorStream(true);

        Process proc = pb.start();

        String raw = new BufferedReader(new InputStreamReader(proc.getInputStream()))
                .lines().collect(Collectors.joining("\n"));
        
        System.out.println("Raw PMD Output:\n" + raw);

        proc.waitFor();
        int exitCode = proc.waitFor();
        if (exitCode != 0) {
            System.err.println("PMD exited with code: " + exitCode);
            System.err.println("Raw PMD Output:\n" + raw);
        }
        /* ---- format output nicely ---- */
        String formatted = formatPmdOutput(raw);

        /* ---- persist ReviewResult ---- */
        ReviewResult rr = new ReviewResult();
        rr.setSubmission(submission);
        rr.setIssuesFound(formatted.isBlank() ? "No issues found." : formatted);
        rr.setSuggestionSummary("PMD static analysis completed.");
        rr.setReviewDate(LocalDateTime.now());
        return resultRepo.save(rr);
    }

    /* Pretty‑print only real violation lines, skip PMD warnings */
    private String formatPmdOutput(String raw) {
        List<String> allLines = Arrays.asList(raw.split("\n"));
        allLines.forEach(line -> System.out.println("Line: " + line));  // ✅ Debug

        List<String> issues = allLines.stream()
                .filter(l -> l.contains(".java:"))
                .collect(Collectors.toList());

        if (issues.isEmpty()) return "";

        StringBuilder out = new StringBuilder();
        for (String line : issues) {
            String[] parts = line.split(":", 4);
            if (parts.length >= 4) {
                String file = Paths.get(parts[0]).getFileName().toString();
                String lineNum = parts[1].trim();
                String rule = parts[2].trim();
                String desc = parts[3].trim();
                out.append("File: ").append(file)
                   .append("\nLine: ").append(lineNum)
                   .append("\nRule: ").append(rule)
                   .append("\nDescription: ").append(desc)
                   .append("\n\n");
            } else {
                out.append(line).append("\n");
            }
        }
        return out.toString().trim();
    }
    
    public List<ReviewResult> getAllReviews() {
        return resultRepo.findAll();
    }
    
    public ReviewResult getReviewById(Long id) {
        return resultRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + id));
    }

}
