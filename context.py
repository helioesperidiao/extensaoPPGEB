import os
from pathlib import Path
from datetime import datetime


def gerar_arquivo_projeto(
    diretorio_raiz: str,
    arquivo_saida: str = "conteudo_projeto.txt",
    extensoes_incluir: list = None,
    pastas_ignorar: list = None,
    arquivos_ignorar: list = None,
    incluir_arvore: bool = True,
):
    """
    Gera um arquivo texto com o conteúdo de todos os arquivos do projeto.

    Args:
        diretorio_raiz: Caminho da pasta raiz do projeto.
        arquivo_saida: Nome do arquivo texto de saída.
        extensoes_incluir: Lista de extensões a incluir (ex: ['.py', '.js']).
                          Se None, inclui todos os arquivos de texto.
        pastas_ignorar: Lista de nomes de pastas a ignorar.
        arquivos_ignorar: Lista de nomes de arquivos a ignorar.
        incluir_arvore: Se True, inclui uma árvore de diretórios no início.
    """
    # Configurações padrão
    if pastas_ignorar is None:
        pastas_ignorar = [
            ".git", "__pycache__", "node_modules", ".venv", "venv",
            ".idea", ".vscode", "dist", "build", ".pytest_cache",
            ".mypy_cache", ".tox", "env",
        ]
    if arquivos_ignorar is None:
        arquivos_ignorar = [
            ".DS_Store", "Thumbs.db", "conteudo_projeto.txt",
        ]

    diretorio_raiz = Path(diretorio_raiz).resolve()
    arquivo_saida = Path(arquivo_saida).resolve()

    if not diretorio_raiz.exists():
        raise FileNotFoundError(f"Diretório não encontrado: {diretorio_raiz}")

    # Extensões consideradas texto (caso extensoes_incluir seja None)
    extensoes_texto = {
        ".py", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".scss",
        ".java", ".c", ".cpp", ".h", ".hpp", ".cs", ".go", ".rs",
        ".rb", ".php", ".swift", ".kt", ".sh", ".bat", ".ps1",
        ".json", ".xml", ".yaml", ".yml", ".toml", ".ini", ".cfg",
        ".md", ".txt", ".rst", ".csv", ".sql", ".env", ".gitignore",
        ".dockerfile", ".makefile",
    }

    # Coleta todos os arquivos válidos
    arquivos = []
    for caminho in sorted(diretorio_raiz.rglob("*")):
        # Ignora pastas da lista
        if any(parte in pastas_ignorar for parte in caminho.parts):
            continue
        if not caminho.is_file():
            continue
        if caminho.name in arquivos_ignorar:
            continue
        if caminho.resolve() == arquivo_saida:
            continue

        # Filtra por extensão, se especificado
        if extensoes_incluir is not None:
            if caminho.suffix.lower() not in [e.lower() for e in extensoes_incluir]:
                continue
        else:
            # Inclui apenas extensões de texto conhecidas ou sem extensão
            if caminho.suffix.lower() not in extensoes_texto and caminho.suffix:
                continue

        arquivos.append(caminho)

    # Escreve o arquivo de saída
    with open(arquivo_saida, "w", encoding="utf-8") as saida:
        # Cabeçalho
        saida.write("=" * 80 + "\n")
        saida.write("CONTEÚDO DO PROJETO\n")
        saida.write(f"Diretório raiz: {diretorio_raiz}\n")
        saida.write(f"Data de geração: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        saida.write(f"Total de arquivos: {len(arquivos)}\n")
        saida.write("=" * 80 + "\n\n")

        # Árvore de diretórios (opcional)
        if incluir_arvore:
            saida.write("ESTRUTURA DE DIRETÓRIOS\n")
            saida.write("-" * 80 + "\n")
            saida.write(_gerar_arvore(diretorio_raiz, pastas_ignorar, arquivos_ignorar, arquivo_saida))
            saida.write("\n\n")

        # Conteúdo de cada arquivo
        for i, caminho in enumerate(arquivos, 1):
            caminho_relativo = caminho.relative_to(diretorio_raiz)
            saida.write("=" * 80 + "\n")
            saida.write(f"[{i}/{len(arquivos)}] ARQUIVO: {caminho_relativo}\n")
            saida.write("=" * 80 + "\n")

            try:
                conteudo = caminho.read_text(encoding="utf-8")
                saida.write(conteudo)
                if not conteudo.endswith("\n"):
                    saida.write("\n")
            except UnicodeDecodeError:
                saida.write("<< ARQUIVO BINÁRIO - CONTEÚDO NÃO EXIBIDO >>\n")
            except Exception as e:
                saida.write(f"<< ERRO AO LER ARQUIVO: {e} >>\n")

            saida.write("\n\n")

    print(f"✓ Arquivo gerado com sucesso: {arquivo_saida}")
    print(f"  Total de arquivos processados: {len(arquivos)}")


def _gerar_arvore(raiz: Path, pastas_ignorar: list, arquivos_ignorar: list, arquivo_saida: Path) -> str:
    """Gera uma representação em árvore dos diretórios."""
    linhas = [raiz.name + "/"]

    def _recursivo(diretorio: Path, prefixo: str = ""):
        try:
            itens = sorted(diretorio.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except PermissionError:
            return

        itens = [
            i for i in itens
            if i.name not in pastas_ignorar
            and i.name not in arquivos_ignorar
            and i.resolve() != arquivo_saida
        ]

        for i, item in enumerate(itens):
            ultimo = i == len(itens) - 1
            conector = "└── " if ultimo else "├── "
            linhas.append(prefixo + conector + item.name + ("/" if item.is_dir() else ""))

            if item.is_dir():
                novo_prefixo = prefixo + ("    " if ultimo else "│   ")
                _recursivo(item, novo_prefixo)

    _recursivo(raiz)
    return "\n".join(linhas)


# ============ USO ============
if __name__ == "__main__":
    import sys

    # Permite passar o diretório via argumento de linha de comando
    diretorio = sys.argv[1] if len(sys.argv) > 1 else "."

    gerar_arquivo_projeto(
        diretorio_raiz=diretorio,
        arquivo_saida="conteudo_projeto.txt",
        # extensoes_incluir=[".py", ".js", ".html"],  # Opcional: filtrar extensões
        incluir_arvore=True,
    )