# Ok, mas será que os dados da Una são justos?

### Atenção: matemática e estatística à frente; prossiga com cautela

Como muitas pessoas duvidavam que os dados da Una eram justos, eu fiz uma análise estatística, utilizando o mesmo script do /d. O *snippet* abaixo foi utilizado para montar a base de dados que será analisada em seguida:
```js
const dices = [];

for (let i = 0; i < 10_000_000; i++) {
	elements.push(rollDice("d"))
}

fs.writeFileSync("./rolagens.json", JSON.stringify(dices));
```
O *snippet* rodou 10 milhões de "d" (ou seja, 1d20), e guardou o resultado de todos num arquivo json.
Foi gerado um arquivo json imenso, de 24,3 MB. Claro, não vamos ler ele inteiro, então vamos começar a análise estatística.
```python
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from statsmodels.stats.weightstats import zconfint
from statsmodels.stats.diagnostic import kstest_normal
from scipy.stats import ranksums, bootstrap

rolagens = pd.read_json("./rolagens.json") # Carrega o dataset
count = rolagens.value_counts().sort_index() # Ordena por número, para que apareçam as rolagens em ordem (1, 2, 3 ... 19, 20)
df = pd.DataFrame(count, columns=['count']).reset_index() # Transforma o índice (atualmente o próprio número rolado) em uma coluna, à esquerda
df.columns = ['Número', 'Quantidade'] # Define os nomes das colunas como "Número" e "Quantidade"

total = rolagens.shape[0] # Pega a quantidade de elementos no nosso dataset
df["Proporção"] = df["Quantidade"] / total
print(df)
```

Isso imprime na tela a contagem de todas as rolagens. O resultado é o seguinte:

|Número|Quantidade|Proporção|
|------|----------|---------|
|1     |500183    |0.050018 |
|2     |500157    |0.050016 |
|3     |498260    |0.049826 |
|4     |500392    |0.050039 |
|5     |500796    |0.050080 |
|6     |501274    |0.050127 |
|7     |499297    |0.049930 |
|8     |499369    |0.049937 |
|9     |499360    |0.049936 |
|10    |500442    |0.050044 |
|11    |500384    |0.050038 |
|12    |499112    |0.049911 |
|13    |501391    |0.050139 |
|14    |500007    |0.050001 |
|15    |500868    |0.050087 |
|16    |499809    |0.049981 |
|17    |500120    |0.050012 |
|18    |498567    |0.049857 |
|19    |500125    |0.050013 |
|20    |500087    |0.050009 |

Como esperado, aproximadamente 500 000 de cada, pois 10 000 000 / 20 = 500 000.

#### Mas existem alguns valores acima e abaixo de 500 000, será que as chances não são levemente maiores?
Não necessariamente. Na verdade, seria estranho se todos tivessem exatamente 500 000, pois a chance disso acontecer é EXTREMAMENTE improvável. Sempre há um pequeno desvio em dados estatísticos, e devemos entender a tendência geral. A estatística nos dá várias ferramentas para isso.
```python
df[["Quantidade", "Proporção"]].describe()
```

|     |Quantidade |Proporção|
|-----|-----------|---------|
|count|    20.0000|20.000000|
|mean |500000.0000| 0.050000|
|std  |   819.0285| 0.000082|
|min  |498260.0000| 0.049826|
|25%  |499366.7500| 0.049937|
|50%  |500122.5000| 0.050012|
|75%  |500404.5000| 0.050040|
|max  |501391.0000| 0.050139|

A média não é muito útil para nós neste caso. Ela é a soma de toda a contagem de rolagens (10 000 000) dividida pela quantidade (20). Nada muito surpreendente aí. Mas num dado viciado, o [desvio padrão](https://pt.wikipedia.org/wiki/Desvio_padr%C3%A3o) (std) é quem acusaria problema. Nesse caso, o desvio padrão foi de 0.0082% (ou 0.000082).

#### Ok, para de me enrolar, o que esse número diz sobre a distribuição?
Por exemplo, considere um dado extremamente viciado. De 10 milhões de vezes, caiu 1 vez cada número, e todas as outras caíram 1:

```python
rolagens_viciadas = pd.Series(np.concatenate([np.arange(1, 21), np.full(shape=total - 20, fill_value=1)])) # Simula uma rolagem absurda, 9999981 vezes 1 e 1 vez cada outro número em um d20
count_viciadas = rolagens_viciadas.value_counts().sort_index() # Ordena por número, para que apareçam as rolagens em ordem (1, 2, 3 ... 19, 20)
df_viciadas = pd.DataFrame(count, columns=['count']).reset_index() # Transforma o índice (atualmente o próprio número rolado) em uma coluna, à esquerda
df_viciadas.columns = ['Número', 'Quantidade'] # Define os nomes das colunas como "Número" e "Quantidade"

df_viciadas["Proporção"] = df_viciadas["Quantidade"] / total
print(df_viciadas)
```

|Número|Quantidade|Proporção   |
|------|----------|------------|
|     1|   9999981|   0.9999981|
|     2|         1|1.000000e-07|
|     3|         1|1.000000e-07|
|     4|         1|1.000000e-07|
|     5|         1|1.000000e-07|
|     6|         1|1.000000e-07|
|     7|         1|1.000000e-07|
|     8|         1|1.000000e-07|
|     9|         1|1.000000e-07|
|    10|         1|1.000000e-07|
|    11|         1|1.000000e-07|
|    12|         1|1.000000e-07|
|    13|         1|1.000000e-07|
|    14|         1|1.000000e-07|
|    15|         1|1.000000e-07|
|    16|         1|1.000000e-07|
|    17|         1|1.000000e-07|
|    18|         1|1.000000e-07|
|    19|         1|1.000000e-07|
|    20|         1|1.000000e-07|

A notação com "e-07" no final é uma forma de escrever [notação científica](https://pt.wikipedia.org/wiki/Nota%C3%A7%C3%A3o_cient%C3%ADfica) em computador, equivalente a "10 ^ -7". Como pode ver, o dado simulado é um dado absurdamente viciado. Vamos ver como está seu desvio padrão:

|     | Quantidade|   Proporção|
|-----|-----------|------------|
|count|  20.000000|   20.000000|
|mean |500000.0000|    0.050000|
|std  |2236064.000|   0.2236064|
|min  |   1.000000|1.000000e-07|
|25%  |   1.000000|1.000000e-07|
|50%  |   1.000000|1.000000e-07|
|75%  |   1.000000|1.000000e-07|
|max  |9999981.000|   0.9999981|

O dp (desvio padrão) aqui, proporcionalmente, foi de 0.2236064, ou seja, 22,36%. Esse número tem muito a dizer sobre a distribuição.
![Gráfico do dado injusto com linha de média](https://cdn.discordapp.com/attachments/295368964068999168/1118709866324824104/image.png)

A linha vermelha no gráfico representa a média dos valores. Caso a distribuição do gráfico fosse homogênea, ou seja, justa, todas as barras estariam aproximadamente na linha.
![Gráfico do dado injusto com linha de média e linhas de desvio padrão](https://cdn.discordapp.com/attachments/287089892415242241/1118886983247347744/image.png)
Aqui, eu fiz:
Linha vermelha: média
Linhas azuis: média ±1 dp
Linhas verdes: média ±2 dp
Linhas amarelas: média ±3 dp

Em distribuições normais:
A média ±1 dp contém 67% dos dados
A média ±2 dp contém 95% dos dados
A média ±3 dp contém 99,7% dos dados

Isso não é uma [distribuição normal](https://pt.wikipedia.org/wiki/Distribui%C3%A7%C3%A3o_normal), como diz o teste:
```python
kstest_normal(x=df_viciadas["Proporção"], dist="norm")
```
```python
(0.5384683631209393, 0.0009999999999998899)
```
Com um p-value de aproximadamente 1e-3, essa distribuição teria 0,1% de chance de ser normal, portanto descartamos a [hipótese nula](https://pt.wikipedia.org/wiki/Hip%C3%B3tese_nula).  Nessas distribuições, a dp não pode nos dar um [intervalo de confiança](https://eme.cochrane.org/intervalos-de-confianca-o-que-e-e-como-interpreta-lo/) preciso de forma fácil, então vamos usar outro teste, o bootstrap.
```python
bootstrap((df_viciadas["Proporção"],), np.std, confidence_level=0.997)
```
```python
BootstrapResult(confidence_interval=ConfidenceInterval(low=2.6469779601696886e-23, high=0.4769686467692715), standard_error=0.1322287782458855)
```
O nosso intervalo de confiança é de aproximadamente, entre 5% - 2.65e-23 e 5% + 47,7%, ou seja, entre 5% e 52,7%, o que significa que se você rolar indefinidamente esses dados, a chance é de 99,7% de que a proporção de cada um vai ficar entre 5% e 52,7%. Isso é um intervalo muito amplo, e 5% está no final do espectro. Uma distribuição com dados justos, que deveria ter a proporção aproximada de 5% toda vez, não devia ter um intervalo tão grande, devia ficar próximo de 5%.

Agora, para o último teste no nosso dataset de dados viciados. Sabendo que essa é uma [distribuição não-paramétrica](https://pt.wikipedia.org/wiki/Estat%C3%ADstica_n%C3%A3o_param%C3%A9trica), aplicamos o teste ranksums, usado para testar a hipótese nula de que uma distribuição x veio da mesma fonte de uma distribuição y. Vamos comparar os dados com o que nós esperamos de dados, ou seja, todos os números deveriam ter 5% de chance:
```python
ranksums(df_viciadas["Proporção"], np.full((20,), 0.05))
```
```python
RanksumsResult(statistic=-4.869016027204134, pvalue=1.1215531208317287e-06)
```
O p-value é de 1e-6! O que significa que a chance de encontrarmos a distribuição esperada nos dados viciados é de 0,0001%. Extremamente baixo, portanto, assumimos que sim, é um dado viciado.

#### Ok, mas como esses testes se saem na distribuição real dos dados?
Bem, vamos lá. A primeira coisa a levar em conta é o número incrivelmente baixo de desvio padrão. O gráfico com a distribuição real ficaria assim:
![Dados reais](https://cdn.discordapp.com/attachments/287089892415242241/1118918092274270416/image.png)

A proporção desses dados está muito próxima de 0.05, o que é o esperado em uma distribuição não-enviesada. Vamos repetir o mesmo gráfico com os desvios padrões, mas dessa vez para a distribuição real:
![Dados reais com linhas de distribuição](https://cdn.discordapp.com/attachments/287089892415242241/1118922879011147887/image.png)

As linhas estão tão juntas que não dá nem pra discernir uma da outra. E isso é bom, porque significa que nosso intervalo de confiança é muito pequeno. Vamos dar um zoom nas linhas pra verificar:
![Dados reais com linhas de distribuição com zoom](https://cdn.discordapp.com/attachments/287089892415242241/1118926999738646678/image.png)

Eu dei um zoom entre 4,97% e 5,03% para fazer a comparação, uma amplitude de 0,06%. Como não é uma distribuição normal, vamos ter que repetir os testes bootstrap e ranksums:
```python
bootstrap((df["Proporção"],), np.std, confidence_level=0.997)
```
```python
BootstrapResult(confidence_interval=ConfidenceInterval(low=4.002990113234607e-05, high=0.00011008771551384496), standard_error=1.1943509254372788e-05)
```
Entre 5% - 4e-5 e 5% + 1e-4. É quase um intervalo fixo de 5%, com um desvio de apenas aproximadamente 0,0001, exatamente como esperado de nossa hipótese nula de que o dado não é viciado.
