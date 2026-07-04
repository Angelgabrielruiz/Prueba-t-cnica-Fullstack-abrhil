from rest_framework.pagination import PageNumberPagination


class StandardResultsPagination(PageNumberPagination):
    """
    Pagina todos los listados por defecto para no degradar con el crecimiento
    de datos. page_size_query_param permite que el frontend pida páginas más
    grandes (ej. el tablero kanban, que necesita todas las tareas del proyecto
    de una vez) sin poder pedir un volumen ilimitado (max_page_size).
    """
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 200
