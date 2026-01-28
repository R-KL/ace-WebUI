#  Ace-Editor Web-UI Built-in Rust

A high-performance, standalone, self-hosted code editor powered by a Rust backend and a modern web component frontend. The entire application compiles into a single binary for easy deployment.

## About the Project

Ace-Editor Web-UI is a full-stack web application providing a browser-based code editing environment. Designed to be lightweight and portable, it offers a fast alternative to heavier IDE's for quick server-side file editing. The backend uses [Axum](https://github.com/tokio-rs/axum) for speed and safety, while the frontend features [Ace Editor](https://ace.c9.io/) and a dependency-free Web Component for the file tree.

All web assets (HTML, CSS, JavaScript) are embedded into the Rust executable at compile time, so deployment is as simple as copying a single file.

## Features

- 🚀 **High-Performance Backend:** Rust + Axum + Tokio for asynchronous, non-blocking I/O.
- 📦 **Single Binary Deployment:** All web assets embedded; just copy and run.
- 📁 **Asynchronous File Tree:** Sidebar shows the server's filesystem, loading subdirectories on demand.
- 💻 **Powerful Code Editor:** Integrated Ace Editor.
- ↔️ **Two-Way File Operations:**
  - Load and save files directly on the server.
  - Upload files from your PC.
  - Download files to your PC.
  - Or direct file editing ( in alpha version)
- ⚙️ **External Configuration:** Settings managed via a simple `config.yaml` file.
- 💅 **Modern UI:** Clean, dark-themed, responsive two-panel layout.
- **Sharing Features ( beta version ):** The ace Web-UI has option to share the code has URL. [For example, click me](https://r-kl.github.io/ace-WebUI/#PwYw9gJgpgvAYgEQQUQIIElUGtkBcDuc+AQgEYCKAsgOwAWUqtA5gJr4DSpT7mAtgAwhUATibJqTBAEcA8qgBKAV1TswAYQDKqCAHEAntXLsArAC9aAQyzEATKko2mxUwBVF8vUW0APdACl8PWJiJgA7Wm9UHQBmBFpiGQQACSTkABYAdTS-MAAFVGJcgFUAB2jiACcNEtQAOQsWKABLXMpaaKwAZzUMzrBUfgAtJup8UwAONNRUGWN2DShcHSleNQArWjSdOBY1dAAbCgB6JKasP0VyYlp2clRcVZYrOHZ2Qfw0mygXcgydtJASVQaWMlCYAGo9AhQgA1DS5PR+Cy4NRfArINQIGHEPQFIS5FwIYyoNT8B5gTroULsEAo0zkEqUXIsGQyShkyimBD9FT8JhqCx8tQgdBODToHBNKJTJgAN06TXBJPYazGnVItQAjEwSSV0LJaDI0nFwUlvGo-H4YTJyLU-Fh+EliEUwZRaiU0rc4CEwGBaBBEAx0GlrlgpLQjvsQAA2fZwJgADVopj8gxqcCS6DWcEoYBACCmcAsIEGqHGuTWg2QwdLinm5EIyHwtE6+fG8h06AsCCw7HkxEG8g47EoTVYyHIaUo9jgejULiYFgsqF4yCwehAWHQtHk7DgLnQpHQLFq5G7YBK2JKKCY+HwqBYCeQyFCAOQTWjNtCajU5HIYH4GRNT0XgNCaBNwV3DQEwTe5iHwTVeCwXJQnBGwYXQdBKHwI41CwI4NxsFx8CkAAZHUkj8Ip41IXY-AgZBNQQJhOlImEoAyfByB-FxcgqLAdXYEkiiYOwkMEO5ZR0WhwWQOA6wTRQ1lQAAzYheGjCpjFI3J8CZJ1cGA4QMgsI5yB0EgdGmbDxn4dAMg0EA4HItZSE6aZomYVBSIkUjSIgWVNTSQYoH4WooAQaMVNYNQpHGaYVN42UVOzI5UAQKBozgbS0tlaINAqWoVNQNY0gqdA4HStRkDctJFCaBA4GQFTQnGaLiHkNIqFQO4EG8UxSFoX4tFPJC4G8KEoCKbxwxYUi0jQFwZBKTpQIGIEEBEixaD0WpnSSEp5CwXBUDAUg4R0LAGykHQmHITVKGrPsbATc4RIXVMoHwaMXEoTVpnGWgmXIDQQbUMAmH4XgmCKQZ+GiGFyBkPwHMUZcQEu0j5DkMq1hHMAMiYFpkJWphLFqaIbCKTjVqwaKMmmHRCYTNROiKNImHkIp4I0NRubSDRkEoOBamQbxSFQOB5A0DRiCwFxkFlXJ0CgbwNH4UghFQVJjFCMBKBhQZEb-KR2AsKBanvLBBiCIF0BAHUYCdgAyXhIFgEo9FwWgwFCZ3vagXhYAsXhSCaCxQhAKAgA). Also here is another [example](https://r-kl.github.io/ace-WebUI/#PwYw9gJgpgvAMgQQNIIJwHEEFEEEcEDqAwgQEIB2AygCoCSpEAmgGIBytRrrYW7CAzNQQApAAwANAOYAJAM4IA7JQSlJAETABbUgHkASqKLKAigUpg17VkhkRahAJ65aogNZJjzEAGoEsgFoAFgAOwbisQqQAsgCqENhgpHpwkqQ4suSyqQCMSJrGagQAlnoAbkH+9owOYABGspoqAGz+mdm1MYGMCPmBAIbUAB4ANsxqOKQA7gi11EQxAGrUxgh9yrR9cAvGACyD6MaM3ugALlHo9AAK6FJ9-gBMkzpIUw5YMXoO-gi0DrVjtDgk2E5FYRDgMQcKgAXkgAFZ2KLDVwLKBEBYETSaYQ7dDBHhNag7ABOylIg384g46CikhUC1cDiQSNkan8uCgWVogyiCyQUChCH8rGETRIegUUT0pGojHeg0oUVccKOOgWRAAZoNgq5GNRJug4MTLkRccT+GQwJRcEy4GsEJNsoNyOhJOJ0Fg+ghAmA9E1JJRiSBKKQABy0aSMVikVi1UjBOArKDGe4IcYIKJgBzRggISSXYxwUjiIiMIjwuBNaH+JDBCAeRh6AgEBzGGKuVaUYyySM7IiSIr8SRe7DE2ggLCyVzoQKuWiSRj1bPCBAgEh9VysHQ7HZQYKXEUxKBwqJEVxgOExEAIYwgZiiUOXKKaYIIBB4qLCOl6OnUVhFXAFkofxajhQJAlEbJTmCEAYhOSg1CKcRiVYaQiFfaFZB0JoCEbVQFiiKJmFkUg+lwZg+lqWCiGkSYpVQchGEGcQmMuJBdWJQswCIKI4ECe5SlcZNkGMPQYnQShaGIFZhFDPpGEYchNBiKJiUYPoqVqLBGAAVgcA04UmfxBmJI1ZAcShxNELBBlkPoyjUOA4HsIxQzgXAoiKMBGEmVwFDhWgICIPoYgCsA9gIOljDhBZAmkGJLmGSZWFkABXBAdEkhB5gIWhhk0BxyFDKZjB0NQmgQcQmh04Y4UoIodMIZhJgWOBMA08DLkkaVUKwJA+h2SQsKIN5grfOBKGGOBREGQr6F2bxWF06FGDhLN-D6S5fSKTRpFIaQHAUVg-J0wYTQ+MBAiKahoTAPMHCIVLLlwfxJlQYQiDURhjGoPQIHQPRUvuRofiaBw1FDcRqAgVKYiQNQkBOUQFADU1aiKRhaEmDGsGYMBhGJaQ4WEbxiROYJUtKahAwQUNjROIoVBDcYoiwaEimkYYsFEIpJVoHS1HIU17kGMEwH4NRhiiQIdIxtQ6SIXBcAUUphBWYxUrASY4CIYxSAQbjqECXBXCIfgtcYUhJKvRUoh2e5KCHARaHvJt2HEBBBmYLBgllHRgkYSRAgIWQmnEfAEAWMBJFDAhhCgXBREkQY32QooIhAqBmCpYwoB06FmGUSQ4GCIhaDhdDxGGVMEDgaEQHQYZ0BiYRlGJOEAHp2DAJpRDfSZUtEahJFQKAwAvTA20obJJF8UQID0WqreYRhNCIbJiSgJRGDgKAPAQVh-RXQZ7hOUgwFEYJc0q2haFkOEEFcVwDHIKAdnZ1wuYUahSGGCANVIITOISciD1jLkgHS3xBg6AYtkTQpQIAn1vv4TQagEDQiwOIGevdyBwh0HbBYohRBqAgFEagGpaioAWG+ZYUBhCizULIKIHdKAQE0GxKIjBZDDHELUKAOgdCMCQDED43hpAnBALEfg3gmiUB2KgCAJxsiTAwawBw4N0ALGEMICCmgApNDhPwPucAdJ2mQPwXApwIDCFYMwE4jB06XGnIEBQ3wIJYFDBAUQsh7jCESIMUolwehqB4qgBwgQdhNDUJQVKes+inD6A4KAGoIJwlzqULMEBsh9AIBVYwpQ4BYMYKUYk-g4AnB3MwYwfRSCiE0LQUUrBLhwCKKlDuehaCl3uFCbsRQdgKBAOQHQOkTgnCaIwfgkwxLSHEGoUos5pAbSIOgZgURhTFx-rIUoP5-BrMGJeYwgx+DQjgOcJoMRRDEkmFgdAOkCChgUEUWgrB7kQB0H0Fe4g+isEmKGLAgRF7cFELgRMQYdDtNRlEVCUJUDGGMJMSQvAkDkGhMIBY9jxCoB2JMYO-BZBFgQTNB+wwmhgB0lAPQcJsiBA+sYVgpRDDQnEFTHYpBQ5IG1gQVgCByBfnKhADulxhCTJ+IMbw5BvBwDhNQJAqVGAEGGHw8gagFDkCIX0NQtRpDGGEKgJAzBSgMvIDEawxgFj+GyNCYkEhJC8ueCAB65wYjnz0AgagoYogIFKNkcgr43wd25OIVKfYNRFGMLSZgEBpCpQgJIVmuAiCTBWH0QIj1yCXG8B3VAWAHAamyPwFcIcFjBEtVgYQHdNAah-L9QOCgFjEkwG+HQjRjBdAQFASQwQDVIA7tLDsEAdKsFEMYM2r0OzqWyEUdm9w+hkVYNCHS3h+C0EoJIdAvhSDBT0DpVAwQDjMHbZIbpa9ghFE4N4O6TRjCXEGGoBwlxuYbkYGPVAd5UDHMYlSToLtFSXHTXoPQzAiClH8mWgmrrJBgRufcWouB+CvRnNIbS0gUT8CwE0EAehgikGyKQJopz219CIH8pot8CKsD6LIPQ9wFChlYOQLW0h0CpQ2pMcg5AomkFdNCOEzBpCUCQJQWom4EBnukNCYIHhYlwGEDoagrhBg6UuJQBYjACyuGyNIPalB-QIC6qUPp-AmjZFQLgLApQCB9AWJp3AYAFjoFILQTyEAbKSFSpMZgxIdK0CaH0UQ6B0ClEXPInQrhMylGCLQBYFByD3HQO6nQjpWCaFFomaIHdvCoBOOQAehEO16AsNqNQqBLjUFfIwY2Dhov3AOsMNsYBfbZoPjwBAVzzCMGGGoQY4jaBIEGDEUMEnXBqFEDiVgIz-BEFIK4XQ1BZASdYKgKulAsAah0KIL4shqBgGJNA6gUsoiDEmEgag7CBHFyQP4JoOxmDxc9dsJAHKFEOBntgYw0hLlEFEFAHyyVKqUFbq4ZgzBfCTBiOQTwyrpCDFoEUbrRR0D4tDPcbwTFvAdjUK4exoVBjUFSsIUg9w4AdyaNIOAOx4QxCln08HSIFgOFkN4TY0J0Aaj4gsJ873axFB9V4IwCxHJwlwDsXAAECDSDAIMPrwRbG2LAOIJTkhhD+H8Gk1gk1aCaFwKtPoqVQy1ECYMHYRRZEPS00gWQUvYyWNEJcWQRQSLgloD7ZZwR7gxG87FAggRWDZBAKGOVWBiQagWJsVkHLvA-UYILe4GxXANWyMsg4b41CQNLuQBwOxPCyUVGoYwnoCBolwJcTQBAohV0uN9CJURKCeaKKQXAmhWCYCPaIUgahqCN8oB3X59O6UxA3LkdwfQ90nGpgygguAXQ6BOBtfgtJA6uEvmNKgnb0GrcxCthw6Pag+jhKUE4tR0BNAWJlrA2RnCqcoIwMAtBcDiEjawYkpACBedD0foi3gNShg8xAMmr+ThAgNQO4QAwlcBzRUo0J-BUhBhUAFByoJM6MSIIBQxnB544BsgIB7hcAg5RcCB0AiA5gYJNNjBn8CBghZ9UpAhsh3sxlGB3MogoB7hmA4AVZhhSgcCdJJAoAThNBshSh+BHNtgQAdIdJeFMBUBo5oRAhOJFBh1aBMZQxNALw4QbBOFCZXRxxE9oRsVggFQ9AO5mA0kNUsA7on8Yg6R3IChRBaAqAmgOwkJgh5B7hNY9BYRyBihYw4RckYhIDQxc4TgdINQagThhA-M717gO8PVBhAjJhul-gYhsCFgFgihuZb5n17hoRJZxkmgnULQx9-oCBfFSAYgdB7hht-B0BJgH0rloQV10BIpZF54ohMJyAAkfU4ZjBRBpAQh6NiQmciBmBLgThmAdgsA4QFBbtyATgRF35DJ0AwBY8oB+AoB-B+AIBhhyBqAlNkQFBUA1A9BLgYhcikAXoQBVdd5yAFB4ZJgqNljYZQxqAPgOgO5NY1BpBQx+BNFagVhWAoBqAsAFBBgsAhlEVKBlN68iNshhhI8sjjBshmB-BpAoBShJhIoVNSA9EohUo7ZsSbxjBJBNBFRshqA1AYhr8UZuU90TxI0sBk5vBAhjBkRQxkRahhBaBjdhAQAiSslah-Aihahfc+hShKBBk9Z+BmBcBhgNR7gb9JgdJdhJBqlGFNBGAO40khlUoHB5UFBlJLk1jJBNiy9GBoRBgQAuSDhVAdI+gLBd1mACAqUxwQB1S1BBYihyAQBJgiBy1JBRB-Yig4Q+hWkutjdLUIsJlxA9BLdEj-AThUA4AdA+FmBps3x3xug3xXBvB-MsB15ghUA3MtjLgklaI8YF1fVUACABU+gNRGBwBjAL0oBiQwBuT4UdI8QFElMTgB53Ar09AFgcTJZsgTgO4HBnU-gdgXxbj7kohtwdB+B8gwdJhvAFASSogHBQwYhCxjBxB8VqB7gkAFB0AC1s49FmBXAmgmhtBhTIydBYtrxaBSgdBfBsNahJI9Aig8YIAFANRKZUTUBshtSU5SBSg3heZXAZBoQFAsA9BcAThZUHB7h8xiQxxSATg1AeC0MCAaD8CtpggoB2ZAg8wNRhgiA4RjphBzJLgFBEkThVwdgogSsdg+hJhiRggYgiTyBSBLh+BUA9BMM5hXAJpiQEB4hLtAhUBzyL8IIt4CZxBpBNAoBhhaAdBSBoQmgTgJoklNBvBSBf5FKvthBqB+AEAYgO5RB99Jl0Adhc1XSDw4Q4QEcIgQBStuAxiWB-BjRiQAJ4sFATgFAb1+AQAFBCkYhYUQBAhCF-LxBJo0QVYgRLh+hBgoBoLlZgg2zSMdIm9mBICSBXAIBvAapXxhSFAypTDBgsivL-LcAkB0ZhBLZghjAIAk0sBUo4AB028g9ZBhBht8UTSOBEgcAiTwYDFZBAhBgiAsjLoE0ThJAiAiASwSLwZmB1BRdW4usEALJyBH4Ao1BJgFBlQLCwA8ZC4+gsA+IdhrEfYQAuNXVvDLxJI6oJMy5KpuxuY2UsAJxWrjjLUpQRxaYeZXy3hx0eZUoApaAoBBhGraAOxQxwI3JzBqCdAFBdKQ5hFAhUplLjAoQO50AeZNdKAQhSAR1kSQB+Y4bNAdBaJEj7hhlvAG4oBAhmA3gro4dAgoggqkAQLvcQkihAhwkNQ+gYdJBJAQ4+JoQWMfh5VXAO4QgA9jYYwEAGTyAZYzY+aTKcJU1ZwEAca3hvhhgta0hVxlJvBaA1JaImhAhJALy9AdBAgPA9AmCEB7g9B-AsAMZyBUoTcFAmhfBGgFBAhSBAhqB7CaVbcZDcAj9UBAhMBNckB-YA89BBgbRGALh+Bw1LkujqlPYVgmgV44A1S9BV1NdTrLgoyEAwJjoigfBNALaGbSATb8Dm5SAUgAwgyjgAsXkThaBcbRAYhvBBhGBZE9BAhvB4geYCBtRUodJSwCB49yRipiQ4sCBvAkaHBBhgTzj0BGZKA+hqKdhvBE8HABST5ddKIKR0AHB8wmSuFMtRNvASL4gKkO0bJIaLanjag9AxB69HkwBFKAlzKEBvEvs8h3cwBvBTSkAdEah549MjxZJvAohvA1BUoActwKk6RShSB0pPoYFTtqAJpugeIFAHBhBIH+M+hhATg5MdBtF0AkAhULhA4oBM0Z8VLJUnlwrZwHAHwIBc1ThdxAhSh9kkBEEZtahTip8kAFhNAxrGRKw2jawmhcBvB77BgKGQkThutSB5Vjioh-Q9r0d1EyBBh68GsFg6NQxaJghvBnbKAiBd08lJhGhWA9C29jBrsJMHAmgIBjAFBS4dAsBKANRvA5hRBe4HcmhQw0rgphAt7xr2LlgkhXQ9AkAQgfZcANZmIAMlDTqZ0ohnoy0QBhFEK+hpA+gNgfEdJgh+MXxJAax-AQBcAdIwBLgmhVjLhJhGB-AO5QxvAYJJ8iBNA7hEG+goB0A1Hggclcd0A1A6aohvFI9M8vQ1AaNZB7ECINQj1cAmhggFgYcdIGVXAMaTVfG0oQBZBHsWMa9hAihghg5AYPoogdJUooBpB7gIAUQk4dJRB7hAhHirKmgDNUpnR7hjBHjSAFhwaJIoBNBRBJhynQx-QJNw4ohW1-AHACAUj1yGnYkvBXRAh-AwAJ7b1vMdhW48LjB0Bah7goAoBGDghy1ghsIigoAO5Ip7gNR0BdSGjAhfgftmANRcBSgQBxAUE9N-ANR-BW5SgBREVmByA+hvB79NAUn9IFgqmcCwAlK+BzlmBUwoAUROlaA2JllAN+QoA7HcB5K2ztKbBhguDAmuEvSVk2yYhvhqKtqFAwBQxGQdhLIwdGTqFHgMYr1GpGpKXAhxkRlggO5BgUiIAQBRBUny0PVhgvRAgYhsgRZIaW5zAYhuhVlAMHwxJsh-BSBBwFirKuXjBoRhbXA8d7MTb7h9aPgkBvACBg7-BcJghSgdJSMj84BvBagdJpBvAj1+EJzvh5zaBQwQBjAK0VQA4ih6235KAOkdASKaRNBg7shfYDgL6CB-h1WdIPUFhEUjjQwdhSghpJgH5hAklZ4uLgQdhGTM8AxmM523hANUgGgigW3KBIYdJKAdBiQ+heNvhN4IAuVvRJBuBGBRBYla2Z4H5pBIk4UTssA1Adg4LWLqK0VY1BEYptTyB2CUjQxuE5hTxhhJoV4WCZHFBmBaBsgxRQOxjBhJBL6shIsdBFaYhJT+SWSUmmcOwxmUnCF5Ub1NABSAPhgKdE8iBORcAgy4AeF0BZMTa2IQACAjj5IX7+QBx3tOmzpUFshV1JgmgdA4FlJEi+DpS0qoJcB-yoBZ7hhIGUjgh-BVl+BS2tB0XBbKJVimhgXpBrrhBsQLmQ8H4HBXBYWyPmAPy4R7hWB7g5JfB-AdIFhmBAgdBFKLmBQih-BUAlKEBhhBgNi2AGoxA81o48B0LvgcNgJxHQg3xvAigvLnoIAGnRm6xV5hhVpNACJ0AO528QBqAVQhFpNCguEKyaxR5UBTqQBoQIA4A9A3JNVUBEi+hiQYh0K4QQB6wUSogkBoRagO8oPRBYpyBYyXpIF0ApXGgqiNRxA4QMbahVpwAog4R-AmVoRkhPgSwm8IA4Q9BshxAia6UYNQXfpUcCkL8SjksO45NdlfZd6IAClfpJgIAAhnxUzmBqBpA9AfZgekGfEsRQxRBjVUp+ARyGMOMZMg8rXMWH9BgYKxDBnJANRyw9ANVihQ18fNnnaLgH4dAg42m4BFivtalIFxNxACALUcaoAs2ZRWxiQbBDD0BsgsB4F5XjBKBoQNQdIxrPw70Z4O5HlJgP6fiFAsN+pBZbwPYHZ+AQwDhBhN09BNAkBppKAHBghxA+xbbn8iBDjB7RBSgJd8D7NghNBoQCA9AdhMZahiRE8CbHgwAM85hjKFB+AdAiAdIkgsHsxVgVm+gL9o8CgAwZ5+B7gogFCMp7hxZQxsgLlqNRBcI+7ah7EHAys12ihTqBDJhgKm+EANR+A4YES5r69UAihvBVddK1Aa9qgxgCBr1AyZ4yiFh+B+BXAxAXCt-Lgfm9ZBhXs7xhBsgdhMpKQCSjvJhaoOwppRBWA9AsPLhaAXFMvpBqVdhz+53Rr75XUu2CcRGMYDsAQClxAgaSJoP+DhC2QHAXBe8CfAnDiYYgcgTTOIDnJKAmEYHUwrgB0C4A1AkiGfnRilC0hAgyDcakOlIA7BpAACIoDoBWCUBuAVsblHCGJBqAeMYaATMMGyAIBcg2JYQKYSwDhphAHkC+IEHyC0xBATFU8KIH4DjUbCgUH1FojjBlEHgpAd9BqCwBIYdIQrN3BMjugNULA7ze4OaCQD8AFAogWoOsUoDoBoQD2TXj2wIA6RVCD4I4p3h+YfAt+fEBMtymECXBxcXsI1uCDebtJLcdjVQkxGkBoYogy3LcCEAgDq5yABaH2EUTCzkBsgqUBYGkIgCXBggxIErAQFEDQhgIYIYwMEDUAuwEcagJxJrizYIBbsWIMiovAID8Awg1AKIG8wPi0ALEayfgNlxTAxQpG+re4DsBWI2Fl6PFTQFgBoxJxxA25HDKiST6uBLg0INRIwDeQmpl2UQXxKC0YAahN4OgEACjgzS8QdIJVd0NIGECooEK2QHQLQDUDCB3IJqaISaCaBHEL0QZE4JcGJjiomwbeQaFiFEA6RrwIvEgFCHBincyw9BWGthg1CXDJATFYCHbFkA6Qg8vWZGEUFEBiRSEJwe4KgDRId8bh8MTEeXgWCHFxAvsM2A1lYDZdWAUQKgGE2RggAw+lAOAJcHEDhRGANDEFPcGyByQjoF8eIc9Hg5DI4ARuCQEiGEBoDCc-ALqOIBlGhgTg3pJ8IwA5CuA6iaUeDLKWgT7hJQYCVKM3kESsBRctFS4A7kWIxhKAsgRgDVg3YtgTgUAUQAfSizkB+i2QUPufkJywVLglwWoA4D6AnBqM3VWQDaGFJ0jr8zHSonCAhBawFgKkHcpmwWAU4tggQWQMSHrQxAOgEAVSvKWnq9Z-AwY4hE33IEOlvC8YNvJ9yu6CAFANGd6HlCPLUBMRgwH4nUNc6DhQsaGEAPFFKAXIMaY+HjFNjWZuYdABAAfmKA7B4DoccUYVMSHfIkJZAw3WYBMloDvlnqqAIgOA3caiRvQ0VPoGQlkCoBiwlAZGPrhQwhtb2e3WIFkyiBKALcVTYNHekkD9iWqmgWoNoROCAQCwrAQYCfkc7JR7IgpRJIwHRQdx84-AYYLXHMrZAyAM4lcrUH0CjUGsagcQL5X3CpRoQ-AV8gfimi1BRAGoJRPMCPGagTgd0NUalAoDEhOs3hUvJQGBJgBre6gbqOoFqCSBky8IAgOIDQGTA34XbYsAsB0D50CoKwDUIlwWClB201vYYPwMmB-C2E-AvIaaXIBIQ+mxIMDOkMkAgVYOdAHnHCGITIhLYrgOMOfEcgDhC8Z4P5kQCmhMpTIifbILIHGZptEiq4dzLLG8AOANiMQKbHG2hAyoFA0IOIB5miFg5cAkrNiEgHtgYYkAYAPWABBCDCAWwoA4tJ4USD+APckUVDixIWDjFaAQwBYLIEEIPAF0swN0fnlIAf0QAksUgNdWlBP8HA0IGcjPC8gfQHorABYAoEGZcTuGulI7CcjUbEVFwwQDnqFm-jGBy4aGBli5j4FxxhAQPd5j9H4BEAvUKsWHjMCSRuFoQiFCAMwDziNl8edQ6xMGD3DLc06TVNQBqHGC2Z4g1gBAM+jbw7dcwcIL4HvDgD+BNpySWJImzzwQBdwJwYiqAh-KqBrp0dcSiAATJAg9GGgusPNnnCelLglU9erTBUQ6RJg40khMmAvHjIRCz3GIPinAmlA5UhBEVsEQcBUtsgW8LJOfGyhgBcAJRQyJHBeytI6QjCJbOuXEDtDkR2MBADsHqCSBv47EooAHjTrO0PAOwH5I0FebmcsiLJFIoODqYOAzBdIqIPPnYggANUaA7NKO34APxAgeKBTMciIC1AehfGYYEZhACc8+yn2eDN0UT4AwFR8fR5OYPtmHRiQrgfgCwGOwyjqkVfBACk2oA6BHwjsGiP5XTRHlJSmgOkFRhqrbgIAf+cQCcFYBBxJA84VCFOGvT+BUo1TKAArmkBiFDAPEY3EcUHaAsn8wdUcZGT96-xBg5PTcjnwBK+SemlAckYamDAK5DUogKIJQL9HUB76x+VAIal4paATcQYYQDwm0pZjW0r-UMO+T0AnBiQDgPQOQGfhWwIqgISYNHAKC4AFQ5pNAKJBfyhYNQDclbtIFKAKik4BNLlnCE9D3Bl6ScfwKIGYop0gmHPHpleDLzcVjwBYKENWTLys5aQz5YIgbHEBf4dI1AOefeFGqxJ-Q4gawJwm4JCg8w75W9qvFnA1lWRkgXkZoFkCRRg80IYwDpHIDiANQh5QCA-A8D3gmyqAA+P-DpRMAO4MNDuFhwUDCBgFFDOAKUDGIahggoEC5pMA1CY84AagChikycSIB2KrLRkEgG-zPcNQRTAJFmFSjUAO4nXU7Cwm8DqgxBbSE4PMkOwahWAGoEftkHVIh4igAqTTOZnIB4jKBSABiAg34FIBH+5lNQOsUVaDQKIgjaEOU3EChhQsFSIgPhizjP44QoYKAB7l5TDBYkRJGHAgGkDF47F3s8CR5nrxqM9AZtQ-P5lIxupwaSAC4NyiIDcQgc3A-WLCkEG0hSA+qWYfwFDzsh8KxsX5C8jYFWwigI2W5BQqvQUL3FIvJ8DsFfD8Itq3nfmfcDWi0LZ0dI8QFAEWz3Azer-V4kgFB6vFjArgfQFyWy6iBGAcgIsMUE84gzQCrvTHKwHWoHinwy7AgGoARBTDJAzZYQKlFJxehMUsA3AIEBAAZE-WkwagEnyDo59x4IrZYCAD2UIRhgDeBwFIAUBthGAisuaivHGJOS-K9wGiAwBaRYBvMUse4GkH1gVS9MjcLktQBtLptjALaFppZ2nrgTyFagKpGSXLblD5lkgczjknGJYA1RqaLsIyVDAy0e88ZKAEvNkCV576YgnbuNW3z2BUoF6ROcYCQDQUuw3KWgBYENJ2AHoHcWQK4kuCNNmA1cCEHYFGr+BcFPAgMF2iiAeo0ghdYQODlfJzAeAtFYIqMnuDgAEAJwHNNS257DAFgabElcEDhCZlVwZEamYzCYA58BAyShBA4BfELzACJwXjMOFzpAhawOSWNPtFwCYZKACgOIH0H9jHAdAB4aQKkGrCMBNyhSVgAdmyB8Q6MNLGZqsq8ULFUO3dY2PWCiCg87hjqiaLfh4B1BkyroZEPnmEAu0gMMQcXhOGXFS4SEs+KJYBlMRNAAM7EWgOJDADPTjAa2BUrUGeQD9MGS3OpKgGiFaYtg+0UMFdi9T3AsAWeE4Auj0jc8+yspY0B+XXqpQpYegBoiJT+LQhUEIAHSSAB+rfQNQRJMHIMCtCeLtad8a4NVVzitZSgPsUhrDKwAq4ZyEAIoCagsl+jHMIAZ-FawgBqAtciWOtJ1hi7SBDsz0MIopBnY8cPIF2TtKmk-hCgaAiEcIM9FWJkkqGhLPoEFDTikBKg-AKgWjxtXmdkRNoYICoglyhhxmWfEAIMFSi7RM6Xbf6L6UGgv8mgsgRYisIcAdwlKimdAEhn7K2gdgcIDAABmylj488ZJd0mMqAK4xNAcAYqPUmhDPBMpDgQiDEEmBqBdmbUJoFNBADyLe6bYcamo2uld0Ygb4NdEIkYChgBArwuOBYFVytoigZCd8N8CiDSS7YTQBQKtGjgEADyIOckIwFcClFa8QwPUMmXRwEkfGM5c7MMCKCbM0xPycdUBlHaPK+opAo6BcFKH2UTgpsXAHNiwLNJWBsgahNSjmyGr2CN4CShrFECMciAMtBQLUDZKf9UoGoVLR8AtpiS9m9YKMnoC35IlPuOaUwh3Fxh2LjK2c3cKIHfjvjLOYAHaGNXKLW9fUZRL5CsE0A-KtW5AOAPtmCCUA4Q0QPMGm24ED8xirARUfzAygXRI4zADuNCT0Aahy49Ycppr3HABjUi-gNQMSGqpghxAWSQGDfljLd1WAWAXigDkgJmAwiM+YHDtkOzSAmqPmHQHd0pSRlV0fSSWElywAMayWGSB2K0x45FQJqgQTpicBFWsAwJ-tRpaGEzx1ZZULgaHRjAcCpRyAVEZCcbN4DulvAWpRRFgCgCXAkMzyLXHdDjnKoZQ35IDEyAFolUOkbtckgvHjlSdKAiQtPk2W8C+CPklwIGEHQGR2MQAC4XAAPyvl8QJtGTVEg+VYCHkFicINDW2GzSDEogRGShkaJjgtgIAxeKyvDrjDvq6hNSEALkUczBAiorqfVFFkpSThggvdLIHAEY5RIvEjBM9ugFYD2VjsszORIHAdCUBzA5cD5NKUNUkBxw3dUpiSXbS0L4+LYIOMuwYBqMVchm4JXaD0B-Edg+ofECszgCuBeWb4QOI6PMAgAAI3VPDG2xenSAyY0Cbch3noQzM7AZ6YvWW25TaUYgYPWwvCD0DGATgvTHYK6kTAwJqCqZWoG+AY3MVE2-QDEImM0A15tkR4ooJIDZI2Brs76RWt6KtE3Qwp0MGcvuChRcYuh1AE4Fj23bHEdIsgACh5MTB44jEDyOOfpBEp-5Uo9ie4PYW9CrRhQtQSYA9FuzWYPsSAayOTB8Z55ykiWdCHdCFA6IZovqF1QBjtjoABgtwoQA4GkBu5otBAMPsDGkDbZk4PzEWrxT0CuAakVIEXg0091Zs1A1MpgsyANCOCkAPO75C4xXWg9PepVb+JUDtBNUzwWAczoEWvYEAbInkUpXrGMij9shc1FcYaTmwaBBoxAKGK4EyoexhgkgDlIwD7BdoQU1I10EjKgCTAsYBwBjCUVFBYBtm2ECXGoB0AOBhg33VTYhrBCaB8olyygFmTsR8EWCfgXSGilgUjZmAKARNJdtKBrNNFfMNWBAGCBnUeOGYUUqpp1D3wVgfEYnYTzqSVh66PYUusP1kA3IEIszYYO0khBIBp+jwPwzknbAnAS+kbAOjopTqkH7gCObUhcBxoi700HCjsNyiPqJpRRQyYsMksTk1UD4TtWqAekihA6qimOEhozGBKUBNAqAZYKUHEAtIDYRQEcbEjthGayVqYfgYwFbiyAjCmgSIs-l2qaDJwDREaJokkButNDNLVaOXFwChhs0aIchtHnmoEkkq8YUMDpCzxjUmgV3KIPvNKB5Q8FCYRjmRLKLoBHNzycWN5DTrcoJK5CYQKQeJBczAV1gmlKFpF6oBGgzEaekxCiClBDQtAfwH2RCCGR6tTAbEIEGUwhd2gJAafq5wy6yAtIawVSrWB-16AhE0-dmiKHJy4ZXAxIagKUBnSlI5e1AbII6oDCsB-AD6WoB21KWisdtGoKIBDH4CFRg42GbqoMB0S+L3xz4fOPzM9hjhGcrzf5IEHEBDZMw4xtJOgAhqRhcYqawAXRm3KoBjWkbDMZfvsjklfT2oJALMnrbowPMq8hkzwE0Ae0uKYAFSAon8DUBlMpJaLvfps2eaOwgBedk4h-3XSfMTFOEEjCiXGAwAmCzQDpER6kwDYI6tlMwBrrgBsgzZSQPxtDDEQBufkjSPwIkBEA-25xeDn6RYCkhSlu7ROmimwBJ7BiFm0oR7isyuS-Ru6lhJWE-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-aqAa0dMArLAVMiTQQUn8WHLUB9Qm-K7PEIxgIgrdzAHSOBXnBx01B+ao2KQ3oBkOdK2HbVH8TYH+sMRRhQOBcDQAGwjRRRJhFoGNYv9vMr14fhACnvU7VkPIdRKBwOhpJXSVqUTKCs8w8KB6TeV8K9YslMQAwMFhwMSAghphpAuECJJcA7iS2pIGURsCsFixDg-GNgSbDoG8jehKLEAPoFMb-xIBn01m0WFzFihwhNP2wT4mRIMwVJ82agRTUQBTFoQQSicop0EiwB-pwI7xKaB8mEGulvAJISNhu1kBnTbmHNxmn4Z6BgceNsgFqVNe0rvhKWkwEAJlNwBU47b6NIKw6UrvBAUYmgdACB2kAcors8YSIdkHHVjdhgiWK9XxmYCJ0+gYLWIbRGGT+iO4sw9xncIuAI5hKBQ5KpoEqIvA9A0gZalHx-yhgedCgVXqQzhBjE9AkwAJMzdjC3hQVP0CSCNLJZ+eViRxXCPbAaSSbhAJB0amOZ-NYdAw6ASIpICAjwdV0BgF4KgEvDsJwo5HOgSANYr8lpAUSuxg8jUDRAUCQ8XcT22urDAOQkDvoPwBmoBANAvdGS00CDz3AU7VBVKIppkCBAGMoxKEiz1OrYQvG7YIgOi1LslxY1sSAwEEglwE1Q6lA7lE1X0jRLfkDeDUCaloCpQvMDmDakvkaj7V7t3Qfwv6GHF5BWBlLXWABSiBd1QN5bORManVbwdqOyR0oPpfIDC0q0hmvjxqGHd+jzIwwYFFsSbDChUw8gIrw5TNe3JLgEplxmETpEHQoALGJ3mkgKFeIjAm03ATMhOCpR4RiyU0ssR5kIMn39bLALlOe64gSSDJQxPWFVjnAV0gI2W7jDpFnlsUnXd8EUF76rxGCfrVwHSTDQtg0QRtblO4vyrgOGAp4WLPQB2BlO7I-uQZqqUkDjWj8lp+4FRSW+DAUgBQpoIhUOzuYQCPQRFplMNBpAwAcqDUMYHv3DJFNcKQYB3BHhww+D0wE8PEHQTuBeBGG0AeIEK2d+9Ma5PoOFV4SARM0ioKgXgPryZUZLcIQdCnRS2WCFgBPSQGFg5j5BTQGUDPBlzplLlThF9wMoHYEeJ7kblFax25bEGgERCS3FLx4hZFRvBNLRxwPQCdXSgZYjKF1VC0WMagBekyWPjDzIXZFbHblkJXkDU8cID4iDJyhcASUww0aiiYxLOKqGIk5UfgURwWqUQAtQlXEAHt0mPdGAUBfkLOhSBolZgDEAt+ZMkuAeRLOAe0YgBQGxR05IMGoBXEYxXYg71DuHtF8KZiApphsTdWbxSgPVHrBnUWoEuB9cZvH6BagB5CHY7oRNHAc22eEUuVdYALxSBp1BwGRsXwC6zpAVAFwHXQOzO20z1ZAWdn4BUoP6EwZD9XyW6BHNTiAOAgCK7izwLgFs3pxe0DuBKcEUPHnUoUAczBwxuGKUlNF05A01kBW+fDEDhPUElQWJkjdkXHNkBSNGdwLBIKAsIwwfsGjQBbbOC3JXZGfA6A2IA6CJMHEGvhto8qHoiiARxFR1KcJqanUvhUAe5x95SaIgCP48pVIl1sMxTQ2DEumaSWVgD4ZECQYcABYF0UuhaEAzxh0aWF2FDsSqGhAOmLNBXh10BVEAQvUdxlVxA9HW29BrNQhGSR5VA8E-MF0bpHcZhjCcFMJ27C6lIMsLaCx-syAMZGbdRCW7FRxS6UoGj566QEl8UOcK9iFcE4FqW8lkRHQntwdyExCEwFRUPHIAQeAxxK5XAUKwpwmwLemXpCITrGFwDHH4nUgcvVuFlQ+6R8SS444UDjaFFjCcFgNiAaUlMEnoKAFdNiYSzAhYZgYQGBwL8AsEFIUIU-DUxsgDUBDglGecndAWXJ9QgB1KHYClQxiBYBS4nmctjLgCWazV1A9uAWAfU+IPQFyV+gSYDGJkARNAiQJwVICTZkBNeDERAEaRVwFN4WoBGgyHNog6ZtvJjRsEsAdiTqID0POCYVrNc-ENdiQHH0lACATIEehsMS+hHI1yaEDB1J8fMkehksHjllBmOXimGB8KGC0CBNLO633pSAbhkWglsM+314vYGwggl6oH5EvpUiPELjpv7A-2UBTkdY0hAeNFfRTFvMVVH8BjdD72IQ10a6j8FkIVgCjRxaVAAaYXuMoGJBJ5KqA7hXxURwEBwjavhsAuMDUFpN72L61YAQBLHDUAFgIrwtBliSlhzCCgRAwWlSpBoDZEB7djhTFkYAehxEphHYE-gRSSIggBUAE2g2wo0TRVxE9AeoDURKiIoFEl8BbtADBEKYYwCZnkLxRolSBXJEiFyoGHErsQoXMA+ZSAR7WoxySfi38A0QOiFSAiAQZDrhGoUv1NcFRYSmRgP6HyBAtrBDzkEJcANJE5p5cNEGhIfdT2AaMV1ICQtY8ycBytCKFBCDWwe7WijlRyoHQE80O+D0AoQeENWCJIyoaNGB4KoQIA7QCtECG9hmycbX3UJ6E4Fxo2BKJUmBFFL4DPBabRLiQBE6BUkRhZqW-Ask9qVwEkJkyMAAoZ6yBFUpJ5I8GBtJHIankzkuyTGzc9KAEZGp4LA48BnAn3Su3yJx4YOD1Q5REdAgBqeDAlkA7JOqToQLTA7xEp7YJPgbRX4YwJvw33NaAvUZrCUnsBEeC8hNoxJA1APEA6bpABRSnR8l6FTgZHDPs+6KNDnkq4NUgdJPAIK3sB8yZYUkQyHVHTe8kJOiEIpALB63fNawAWjuhKwG5j4MsYO9CO0ZLCFg9xukWmFrcIwDQCd4fkOCAwAGKbwgn0dCDkiOwOJUVWUBJ1YeyKA5EfgGbxE2Q9k+NX7CAFmEgIGqGlIYgM0jasGgGSyIA8w2EHTNGoDUF4s1oCyR7haAIHXzxFALAG5Bp6WpDWxQwQOBSNqAI-1+QscD+jgA5AVYCNxfEZWlRJg4GIFsx4+cREeQEobXG09i4ARF9BU1cwAKERAWFG8AFOMRDD4PaHcGK99sV2hvRpAEXl8wPQSyAFA1GI5ySBOIQelkA0QIkmfhN4BpG+wB7V-nQBHdfPGWcoAfAUW4k6QIB4xXaEDi6wFODag6xqAcgG7p+yFwGGB8CKp33x6EZImRAbhDtCYtpwNCRAQ2YWnyVIIaIeGWASVOgUQ0-sagAbh39ZgFQANQIlg7g3WUzh7hq6EXR+Vfoa9l1x1AW2lWgH9K5EYJxADNggAluSlgjADQbZFqAdgNPg8Y9GB-DzgtwTYnkU1UZRAhgSiCFiu4yQAUi6c6rBACvQ3gW5G541NFLVpA6RB6I8QDJLIH9puUQkAioG4a9jyklYeRTskCoWUBuRWsbgGCDZEMACsjNAAtEuAAEMlBXhNeUiG95RiYuCr0xiXAFSh74CjHsRbJUFhkYMEL6AyRWoOxj0YGaeeWywwOe73fBkgBCBApiIINCM0e9XIUaMgYe4ATAJSWRCaAyuYfxDhhkDeX4ExQEVnWwPvPYK3pDLfWln9vMZTFrJtYegA1BtUeTBv5cYD9V-g88VCJK4vSV2J8xAgFzG6QdAfFGGwBuGwHkxmQajgwI1iSgF4ok+dAEDITkYkGYB2YDuAMctkMAHQAZGFTmxRSAIIiOZvAcQFah7WG-GB4fXLACGA25BMkao6Qc-nsRMwblFxheXLTlxpeCIF1fIOQBCj7YbgPHgf5bBMAGLtVMW9leEWAJoEMoFgFWQKRJAM4AUByUNeBnIfQExg8d+AIImdBmKSQCTd0AIREsRBif5DPYG8CRCoNFaOmDn14zFEBF45EfjHiEEAVKCTcLQSgGzlX1KOklIOUELhkNagKDiwBRvVABYwTgGKLkBIWK7DhACCAaTCY8oBTnXh04UpUCpI4OoVgFUQbcK7APUS4BKxAMYsL1hQeTQAokUddAAoVsMfNGmxfgQuBmCeKRpR0gZyPCO1RxiOtFIg3MHNHfAPvTGGSp1xEJg1BTXDEQqxXEWgCzI9wlsWPwZgJOhIAlSQUlZA3aD5HKFeGRMDgASIA4kShlGPCKM0DUFKDvRk7DtAChVlMiRXB+vVPBvAYgSdV2hnURIC5glA2QGMBp+A5hREtWX01WA3JIO3PcggL8QWAsCNdBXAiKPwDIcrI36ATZtHbJG1AeZbQWlRIMSzAbhR+UPkZpfuM+GwxhKOxiwY6SbuRTo1OHimfhhsOMzbxcDMACtRT4dhKMjiQFGD0Z4vOdVhBwAIQxSsL8WoFShmAZtF8xVgB0B3JMGLREhAgRdGkMSHVQkBMYAvG7UWQRoAriIBTCXi1nAo4Q9E5huUbRjmtjAe-Ewx91KVATYfyTmyOpaAX7kvYRcNnBf5Soct0gYa8BwDZRxASvDeBh7cxhqgVQajg45SuDMENIXgQJTcAvAAZAWlR4OSiFYthHYDjg9UIXzyANBQKjPhTODeAYor5WqEOJd7DO0R5ZhVMhfBypPuFEAXEP9AXlHsK0Wn5uge-F2QuyfO0pp8QBYG29xABwGK9vImIlShmbeZHvx0JaWl6YEqEAFO5hMCBGyg2qDuCmNSgUwDWZmmFijnZrUdoM1kx4KUG2DWqVgCKdRkExkUAbPQnzMFKIKlEe1BNT2G8AuoJSDjRdUEQgehiQOojJjJADuAU4U4BABgAb0gADJlCaABgBAyUoEow4NW5hOBb0wAhhZYAP-HP8L1PoCAA) that shows the JavaScript code used to build this 
  > Note that this method encodes the entire code in URL and for larger codes, the URL will be ugly long,
  >  but works for at least 22,000 lines of code
## Tech Stack

**Backend:**
- [Rust](https://www.rust-lang.org/)
- [Axum](https://github.com/tokio-rs/axum)
- [Tokio](https://tokio.rs/)
- [Serde](https://serde.rs/)
- [Rust-Embed](https://git.sr.ht/~pyrossh/rust-embed)

**Frontend:**
- HTML5 / CSS3 / Vanilla JavaScript
- [Ace Editor](https://ace.c9.io/)

## Getting Started

Follow these steps to set up the project locally or on a server.

### Prerequisites

Install the Rust toolchain and standard build tools.

1. **Install Rust:**
   ```bash
   curl --proto '=HTTPS' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
2. **Install Build Essentials (Debian/Ubuntu):**
   ```bash
   sudo apt update
   sudo apt install build-essential
   ```

### Installation & Usage

1. **Clone the repository:**
   ```bash
   git clone https://github.com/R-KL/ace-WebUI.git rust-ace-editor
   cd rust-ace-editor
   ```
   *(You can use any folder name; scripts assume execution from the cloned directory.)*

2. **Configure the application:**
   Create a `config.yaml` file (optional; defaults used if omitted):
   ```yaml
   server:
     host: "127.0.0.1"
     port: 6556
     base_path: "/"

   storage:
     files_dir: "my_files"

   defaults:
     theme: "ace/theme/chrome"
     font_size: 14
   ```
   Or generate a template via terminal (from the current working directory):
   ```bash
   echo "# any part of this yaml file or the entire yaml file can be omitted to use default values
   server:
     host: \"127.0.0.1\" # default value
     port: 6556 # default value
     base_path: \"/\" # default value

   storage:
     files_dir: \"my_files\" # The app will create and serve files from this directory

   defaults:
     theme: \"ace/theme/monokai\"
     font_size: 14
   " > config.yaml
   ```

3. **Build the application for release:**

   Prebuilt binaries are not available due to dependency differences. It's best to build from source. You can delete everything except the `target` folder after building. This command compiles the code with optimizations and embeds all the web assets.
   ```bash
   cargo build --release
   ```

4. **Run the application:**

   - **Option 1:**  
     The final binary will be in the `target/release/` directory. Run it as:
     ```bash
     ./target/release/ace-editor
     ```

   - **Option 2:**  
     Optionally, use a production-grade process manager like pm2 or systemd to run this in the background.

     **Using systemd**  
     (Assuming you're running a Linux distribution like Debian/Ubuntu that uses systemd by default. For other distros, refer to their docs or use the method above.)
     The below code should be run from the cloned directory (`rust-ace-editor`). If you move the binary, **edit the WorkingDirectory and ExecStart path in the service file** to the new absolute path.
     ```bash
     sudo tee /etc/systemd/system/ace-editor.service > /dev/null <<EOF
     [Unit]
     Description=Rust Ace Editor Web UI
     After=network.target

     [Service]
     Type=simple
     User=$(whoami)
     WorkingDirectory=$(pwd)
     ExecStart=$(pwd)/target/release/ace-editor
     Restart=on-failure
     Environment=RUST_LOG=info

     [Install]
     WantedBy=multi-user.target
     EOF
     sudo systemctl daemon-reload
     sudo systemctl enable ace-editor.service
     sudo systemctl start ace-editor.service
     ```

     **Using PM2**  
     (Assuming Node.js is installed. If not, install npm and Node.js first.)
     pm2 is primarily meant for Node applications but can generally run any kind of process.
     ```bash
     npm install pm2 -g
     pm2 start ./target/release/ace-editor
     ```
     If you move the binary, update the path in PM2:
     ```bash
     pm2 delete ace-editor
     pm2 start /new/path/to/ace-editor
     ```
     Also, change the directory of `config.yaml` as the binary checks its current working directory only.

5. **Access the Web UI:**
   Open your web browser and navigate to `http://127.0.0.1:6556/` (or the host, port, and base_path you specified in your config).

## Issues

Some common issues and solutions:

| Issue                              | Solution                                                                                               |
|-------------------------------------|---------------------------------------------------------------------------------------------------    |
| `config.yaml` not loading properly  | Ensure the template matches the expected format and that `config.yaml` is in the working directory.   |
| Website appears offline             | Verify firewall settings allow traffic on the configured port in `config.yaml` (or the default port). |
| Settings not saved persistently     | Confirm the working directory has write permissions.                                                  |

## Configuration

All settings are managed in the `config.yaml` file.

| Section    | Key         | Type     | Description                                                                           |
|------------|-------------|----------|-----------------------------------------------------------------------------          |
| `server`   | `host`      | String   | The IP address to bind the server to. `127.0.0.1` for local, `0.0.0.0` for public.    |
| `server`   | `port`      | Number   | The network port the server will listen on.                                           |
| `server`   | `base_path` | String   | Useful when reverse proxying the website under a sub path (e.g., website/base_path).   |
| `storage`  | `files_dir` | String   | The path to the directory where user files will be stored and served from.            |
| `defaults` | `theme`     | String   | The default Ace Editor theme for first-time users (e.g., `ace/theme/monokai`).        |
| `defaults` | `font_size` | Number   | The default font size for first-time users.                                           |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Third-Party Licenses

This project uses the following open-source components:

| Component    | License         | Notes                                                                                                          |
|--------------|-----------------|-----------------------------------------------------------------------                                         |
| [Ace Editor](https://ace.c9.io/) | BSD-3-Clause    | Embedded in `web/ace/ace.js`. License headers are preserved in source files.               |
| [Rust-Embed](https://git.sr.ht/~pyrossh/rust-embed) | MIT/Apache-2.0 | Used to embed static assets into the Rust binary.                        |

> **Note:** All third-party licenses are respected. No modifications have removed or altered their original license notices.

