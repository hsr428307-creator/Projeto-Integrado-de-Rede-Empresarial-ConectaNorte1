# ConectaNorte — Trabalho 4
## Operacionalização segura de um serviço Linux com Docker

**Disciplina:** Sistemas Operacionais  
**Instituição:** Faculdade Serra Dourada  
**Professor:** Guibson Krause  
**Integrantes:** Lucas Moura, Davi Mota e Henrique Do Santos

## 1. Objetivo

Este repositório apresenta um serviço HTTP simples executado em container Docker,
com usuário sem privilégios administrativos, configuração externa por variáveis de
ambiente, logs, política de reinício automático e limites de recursos.

O projeto foi organizado para atender ao roteiro do Trabalho 4 e complementar o
projeto de rede empresarial ConectaNorte.

## 2. Pré-requisitos

- Docker instalado;
- Docker Compose disponível como `docker compose`;
- acesso ao terminal;
- navegador ou `curl`.

## 3. Estrutura

```text
conectanorte-trabalho-4/
├── app/
│   ├── package.json
│   └── server.js
├── packet-tracer/
│   └── ipv4.pkt
├── documentacao/
│   └── Projeto_Integrado_Rede_Empresarial_ConectaNorte.pdf
├── evidencias/
├── Dockerfile
├── compose.yaml
├── .dockerignore
├── .gitignore
└── README.md
```

## 4. Construir a imagem

```bash
docker compose build
```

ou:

```bash
docker build -t conectanorte:1.0 .
```

## 5. Iniciar o serviço

```bash
docker compose up -d
```

Verificar:

```bash
docker ps
docker ps -a
```

## 6. Testar

No próprio computador:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

No navegador:

```text
http://localhost:3000/
```

A rota `/health` retorna o estado do serviço e o UID do processo.

## 7. Usuário sem privilégios

O Dockerfile cria o usuário `appuser` e utiliza:

```dockerfile
USER appuser
```

Para comprovar:

```bash
docker exec conectanorte id
```

O UID exibido deve ser diferente de `0`.

Também é possível conferir:

```bash
docker inspect conectanorte --format '{{.Config.User}}'
```

## 8. Configuração externa

A porta, nível de log e modo de falha podem ser alterados por variáveis de ambiente,
sem modificar o código.

Exemplo:

```bash
PORT=3000 LOG_LEVEL=debug FAIL_MODE=false docker compose up -d
```

As credenciais reais não devem ser colocadas no Git.

## 9. Logs

```bash
docker logs conectanorte
```

ou:

```bash
docker compose logs
```

Para acompanhar em tempo real:

```bash
docker logs -f conectanorte
```

As mensagens registram a inicialização do serviço e as requisições recebidas.

## 10. Política de reinício e recursos

O `compose.yaml` utiliza:

```yaml
restart: on-failure
mem_limit: 128m
cpus: "0.50"
```

Também foi configurado:

```yaml
security_opt:
  - no-new-privileges:true
```

Essas configurações evitam a execução como usuário privilegiado e estabelecem
limites de memória e CPU para o container.

## 11. Teste de falha controlada

Primeiro confirme que o serviço está funcionando:

```bash
curl http://localhost:3000/health
```

Depois observe o estado e a contagem de reinícios:

```bash
docker inspect conectanorte --format 'Reinícios: {{.RestartCount}}'
```

Para provocar uma falha controlada:

```bash
curl http://localhost:3000/fail
```

A aplicação encerra o processo principal com código `1`. Como o container foi
configurado com `restart: on-failure`, o Docker deve reiniciá-lo.

Verifique:

```bash
docker ps
docker inspect conectanorte --format 'Reinícios: {{.RestartCount}}'
docker logs --tail 50 conectanorte
```

Depois teste novamente:

```bash
curl http://localhost:3000/health
```

## 12. Teste alternativo com FAIL_MODE

Também é possível simular a falha automaticamente após 15 segundos:

```bash
FAIL_MODE=true docker compose up -d
```

A aplicação será encerrada com código diferente de zero e o Docker deverá
reiniciar o container.

Para acompanhar:

```bash
docker ps
docker logs -f conectanorte
```

## 13. Parar o serviço

```bash
docker compose stop
```

Para remover o container:

```bash
docker compose down
```

## 14. Evidências para a apresentação

Adicionar na pasta `evidencias/` capturas legíveis mostrando:

1. container funcionando;
2. `docker ps`;
3. usuário efetivo com UID diferente de 0;
4. logs;
5. falha controlada;
6. recuperação automática e aumento do `RestartCount`;
7. limite de CPU/memória, quando comprovado no ambiente.

## 15. Referências

- Material e slides da disciplina de Redes de Computadores, Faculdade Serra Dourada, 2026.
- RFC 1918 — Address Allocation for Private Internets.
- RFC 4632 — Classless Inter-domain Routing (CIDR).
- IEEE 802.1Q — Virtual Bridged Local Area Networks.
- Documentação do Docker e Docker Compose.
