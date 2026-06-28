package com.tasktracker.service;

import com.tasktracker.dto.TaskRequest;
import com.tasktracker.dto.TaskResponse;
import com.tasktracker.entity.Project;
import com.tasktracker.entity.Task;
import com.tasktracker.enums.TaskPriority;
import com.tasktracker.enums.TaskStatus;
import com.tasktracker.exception.ResourceNotFoundException;
import com.tasktracker.repository.ProjectRepository;
import com.tasktracker.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private TaskService taskService;

    private Project mockProject;
    private Task mockTask;

    @BeforeEach
    void setUp() {
        mockProject = Project.builder()
                .id(1L)
                .name("Test Project")
                .description("Test Description")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        mockTask = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .status(TaskStatus.TODO)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDate.of(2025, 12, 31))
                .project(mockProject)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ── CREATE ──────────────────────────────────────────────────────────────

    @Test
    void createTask_validRequest_returnsTaskResponse() {
        TaskRequest request = new TaskRequest(
                "Test Task",
                "Test Description",
                TaskStatus.TODO,
                TaskPriority.HIGH,
                LocalDate.of(2025, 12, 31),
                1L
        );

        when(projectRepository.findById(1L)).thenReturn(Optional.of(mockProject));
        when(taskRepository.save(any(Task.class))).thenReturn(mockTask);

        TaskResponse response = taskService.createTask(request);

        assertThat(response).isNotNull();
        assertThat(response.title()).isEqualTo("Test Task");
        assertThat(response.status()).isEqualTo(TaskStatus.TODO);
        assertThat(response.priority()).isEqualTo(TaskPriority.HIGH);
        assertThat(response.projectId()).isEqualTo(1L);

        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void createTask_projectNotFound_throwsResourceNotFoundException() {
        TaskRequest request = new TaskRequest(
                "Test Task",
                "Test Description",
                TaskStatus.TODO,
                TaskPriority.HIGH,
                LocalDate.of(2025, 12, 31),
                99L
        );

        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.createTask(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Project")
                .hasMessageContaining("99");

        verify(taskRepository, never()).save(any());
    }

    // ── READ ─────────────────────────────────────────────────────────────────

    @Test
    void getTaskById_existingId_returnsTaskResponse() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));

        TaskResponse response = taskService.getTaskById(1L);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("Test Task");
    }

    @Test
    void getTaskById_nonExistingId_throwsResourceNotFoundException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTaskById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Task")
                .hasMessageContaining("99");
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────

    @Test
    void updateTask_validRequest_returnsUpdatedTaskResponse() {
        TaskRequest request = new TaskRequest(
                "Updated Title",
                "Updated Description",
                TaskStatus.DOING,
                TaskPriority.MEDIUM,
                LocalDate.of(2025, 11, 30),
                1L
        );

        Task updatedTask = Task.builder()
                .id(1L)
                .title("Updated Title")
                .description("Updated Description")
                .status(TaskStatus.DOING)
                .priority(TaskPriority.MEDIUM)
                .dueDate(LocalDate.of(2025, 11, 30))
                .project(mockProject)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(mockProject));
        when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

        TaskResponse response = taskService.updateTask(1L, request);

        assertThat(response.title()).isEqualTo("Updated Title");
        assertThat(response.status()).isEqualTo(TaskStatus.DOING);
        assertThat(response.priority()).isEqualTo(TaskPriority.MEDIUM);
    }

    // ── COMPLETE ─────────────────────────────────────────────────────────────

    @Test
    void completeTask_existingId_setsStatusToDone() {
        Task completedTask = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .status(TaskStatus.DONE)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDate.of(2025, 12, 31))
                .project(mockProject)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));
        when(taskRepository.save(any(Task.class))).thenReturn(completedTask);

        TaskResponse response = taskService.completeTask(1L);

        assertThat(response.status()).isEqualTo(TaskStatus.DONE);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────

    @Test
    void deleteTask_existingId_deletesSuccessfully() {
        when(taskRepository.existsById(1L)).thenReturn(true);
        doNothing().when(taskRepository).deleteById(1L);

        assertThatCode(() -> taskService.deleteTask(1L))
                .doesNotThrowAnyException();

        verify(taskRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteTask_nonExistingId_throwsResourceNotFoundException() {
        when(taskRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> taskService.deleteTask(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Task")
                .hasMessageContaining("99");

        verify(taskRepository, never()).deleteById(any());
    }
}