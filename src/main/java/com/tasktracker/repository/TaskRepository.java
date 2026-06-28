package com.tasktracker.repository;

import com.tasktracker.entity.Task;
import com.tasktracker.enums.TaskPriority;
import com.tasktracker.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Filtering by status and/or priority with pagination — done in SQL
    @Query("""
            SELECT t FROM Task t
            WHERE (:status IS NULL OR t.status = :status)
            AND   (:priority IS NULL OR t.priority = :priority)
            AND   (:projectId IS NULL OR t.project.id = :projectId)
            """)
    Page<Task> findAllWithFilters(
            @Param("status")    TaskStatus status,
            @Param("priority")  TaskPriority priority,
            @Param("projectId") Long projectId,
            Pageable pageable
    );
}