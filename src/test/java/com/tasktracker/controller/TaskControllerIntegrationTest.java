package com.tasktracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tasktracker.dto.ProjectRequest;
import com.tasktracker.dto.TaskRequest;
import com.tasktracker.enums.TaskPriority;
import com.tasktracker.enums.TaskStatus;
import com.tasktracker.repository.ProjectRepository;
import com.tasktracker.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    // We'll store the project id created in setup
    private Long projectId;

    @BeforeEach
    void setUp() throws Exception {
        taskRepository.deleteAll();
        projectRepository.deleteAll();

        // Create a project to use in all task tests
        ProjectRequest projectRequest = new ProjectRequest("Integration Project", "For testing");

        String response = mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projectRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        projectId = objectMapper.readTree(response).get("id").asLong();
    }

    // ── CREATE ───────────────────────────────────────────────────────────────

    @Test
    void createTask_validRequest_returns201() throws Exception {
        TaskRequest request = new TaskRequest(
                "Integration Task",
                "Description",
                TaskStatus.TODO,
                TaskPriority.HIGH,
                LocalDate.of(2025, 12, 31),
                projectId
        );

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Integration Task"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.projectId").value(projectId));
    }

    @Test
    void createTask_missingTitle_returns422() throws Exception {
        TaskRequest request = new TaskRequest(
                "",           // blank title — should fail validation
                "Description",
                TaskStatus.TODO,
                TaskPriority.HIGH,
                LocalDate.of(2025, 12, 31),
                projectId
        );

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.errors", hasSize(greaterThan(0))));
    }

    @Test
    void createTask_invalidProjectId_returns404() throws Exception {
        TaskRequest request = new TaskRequest(
                "Task",
                "Description",
                TaskStatus.TODO,
                TaskPriority.HIGH,
                LocalDate.of(2025, 12, 31),
                9999L         // non-existing project
        );

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // ── READ ─────────────────────────────────────────────────────────────────

    @Test
    void getAllTasks_returnsPaginatedResponse() throws Exception {
        mockMvc.perform(get("/api/tasks")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10));
    }

    @Test
    void getTaskById_nonExistingId_returns404() throws Exception {
        mockMvc.perform(get("/api/tasks/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message", containsString("9999")));
    }

    // ── COMPLETE ─────────────────────────────────────────────────────────────

    @Test
    void completeTask_existingTask_returnsStatusDone() throws Exception {
        // First create a task
        TaskRequest request = new TaskRequest(
                "Task to Complete",
                "Description",
                TaskStatus.TODO,
                TaskPriority.LOW,
                LocalDate.of(2025, 12, 31),
                projectId
        );

        String created = mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long taskId = objectMapper.readTree(created).get("id").asLong();

        // Now complete it
        mockMvc.perform(patch("/api/tasks/" + taskId + "/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────

    @Test
    void deleteTask_existingTask_returns204() throws Exception {
        TaskRequest request = new TaskRequest(
                "Task to Delete",
                "Description",
                TaskStatus.TODO,
                TaskPriority.LOW,
                LocalDate.of(2025, 12, 31),
                projectId
        );

        String created = mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long taskId = objectMapper.readTree(created).get("id").asLong();

        mockMvc.perform(delete("/api/tasks/" + taskId))
                .andExpect(status().isNoContent());

        // Verify it's gone
        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isNotFound());
    }
}