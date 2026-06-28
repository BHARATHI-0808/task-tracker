package com.tasktracker.dto;

import com.tasktracker.entity.Task;
import com.tasktracker.enums.TaskPriority;
import com.tasktracker.enums.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        Long projectId,
        String projectName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TaskResponse from(Task t) {
        return new TaskResponse(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getStatus(),
                t.getPriority(),
                t.getDueDate(),
                t.getProject().getId(),
                t.getProject().getName(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}