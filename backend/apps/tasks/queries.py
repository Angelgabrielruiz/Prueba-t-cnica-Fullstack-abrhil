from django.db import connection


def get_top_completers_by_project():
    """
    Query SQL manual (requisito del PDF).
    Top 5 usuarios con más tareas completadas, por proyecto.
    Usa ROW_NUMBER() OVER (PARTITION BY ...) porque un GROUP BY simple
    no puede reiniciar el ranking dentro de cada proyecto: el LIMIT
    aplicaría sobre el total combinado de todos los proyectos, no
    "5 por cada uno".
    """
    sql = """
        SELECT project_id, user_id, username, completed_count
        FROM (
            SELECT
                t.project_id,
                u.id AS user_id,
                u.username,
                COUNT(*) AS completed_count,
                ROW_NUMBER() OVER (
                    PARTITION BY t.project_id
                    ORDER BY COUNT(*) DESC
                ) AS rank
            FROM tasks_task t
            JOIN users_user u ON u.id = t.assignee_id
            WHERE t.status = 'done'
            GROUP BY t.project_id, u.id, u.username
        ) ranked
        WHERE rank <= 5
        ORDER BY project_id, completed_count DESC;
    """
    with connection.cursor() as cursor:
        cursor.execute(sql)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def get_avg_completion_time_by_project():
    """
    Query SQL manual (requisito del PDF).
    Promedio de tiempo de finalización de tareas, agrupado por proyecto.
    Se calcula por proyecto (no global) porque mezclar proyectos con
    naturalezas distintas de trabajo distorsiona el número resultante.
    Se expone en segundos (EXTRACT EPOCH) porque el tipo `interval`
    de PostgreSQL no es serializable directamente a JSON.
    """
    sql = """
        SELECT
            project_id,
            COUNT(*) AS completed_tasks,
            AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) AS avg_seconds
        FROM tasks_task
        WHERE status = 'done'
          AND completed_at IS NOT NULL
        GROUP BY project_id
        ORDER BY project_id;
    """
    with connection.cursor() as cursor:
        cursor.execute(sql)
        columns = [col[0] for col in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

    for row in rows:
        row["avg_seconds"] = float(row["avg_seconds"])

    return rows